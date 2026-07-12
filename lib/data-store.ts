import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

type PgPool = {
  query: (text: string, params?: unknown[]) => Promise<{ rows: Array<Record<string, unknown>> }>;
};

let poolPromise: Promise<PgPool> | null = null;
let schemaReadyPromise: Promise<void> | null = null;

export function writableDataDir() {
  if (process.env.BLANWHI_DATA_DIR) return process.env.BLANWHI_DATA_DIR;
  if (process.env.VERCEL || process.env.NODE_ENV === "production") return path.join("/tmp", "blanwhi-data");
  return path.join(process.cwd(), "data");
}

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

async function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!poolPromise) {
    poolPromise = import("pg").then(({ Pool }) => {
      const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || "");
      return new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.PGSSLMODE === "disable" || isLocal ? false : { rejectUnauthorized: false }
      }) as PgPool;
    });
  }
  return poolPromise;
}

async function ensureDatabaseSchema() {
  const pool = await getPool();
  if (!pool) return;
  if (!schemaReadyPromise) {
    schemaReadyPromise = pool.query(`
      create table if not exists blanwhi_store (
        store_key text primary key,
        store_value jsonb not null,
        updated_at timestamptz not null default now()
      )
    `).then(() => undefined);
  }
  await schemaReadyPromise;
}

export async function ensureJsonFile<T>(filename: string, fallback: T) {
  const dir = writableDataDir();
  const file = path.join(dir, filename);
  await mkdir(dir, { recursive: true });
  try {
    await readFile(file, "utf8");
  } catch {
    let seed = fallback;
    try {
      seed = JSON.parse(await readFile(path.join(process.cwd(), "data", filename), "utf8")) as T;
    } catch {
      seed = fallback;
    }
    await writeFile(file, JSON.stringify(seed, null, 2), "utf8");
  }
  return file;
}

export async function readJsonStore<T>(filename: string, fallback: T): Promise<T> {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const pool = await getPool();
    if (pool) {
      const key = filename.replace(/\.json$/, "");
      const result = await pool.query("select store_value from blanwhi_store where store_key = $1", [key]);
      if (result.rows[0]?.store_value !== undefined) return result.rows[0].store_value as T;

      const file = await ensureJsonFile<T>(filename, fallback);
      let seed = fallback;
      try {
        seed = JSON.parse(await readFile(file, "utf8")) as T;
      } catch {
        seed = fallback;
      }
      await writeJsonStore(filename, seed);
      return seed;
    }
  }

  const file = await ensureJsonFile<T>(filename, fallback);
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonStore<T>(filename: string, value: T) {
  if (hasDatabase()) {
    await ensureDatabaseSchema();
    const pool = await getPool();
    if (pool) {
      const key = filename.replace(/\.json$/, "");
      await pool.query(
        `insert into blanwhi_store (store_key, store_value, updated_at)
         values ($1, $2::jsonb, now())
         on conflict (store_key)
         do update set store_value = excluded.store_value, updated_at = now()`,
        [key, JSON.stringify(value)]
      );
      return value;
    }
  }

  const file = await ensureJsonFile<T>(filename, value);
  await writeFile(file, JSON.stringify(value, null, 2), "utf8");
  return value;
}
