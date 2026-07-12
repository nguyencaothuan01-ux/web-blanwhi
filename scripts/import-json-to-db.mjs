import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const { Pool } = pg;
const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Missing DATABASE_URL. Add your Postgres connection string before running this script.");
  process.exit(1);
}

const isLocal = /localhost|127\.0\.0\.1/.test(databaseUrl);
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.PGSSLMODE === "disable" || isLocal ? false : { rejectUnauthorized: false }
});

const stores = [
  ["site-content", "site-content.json"],
  ["integrations", "integrations.json"],
  ["orders", "orders.json"]
];

await pool.query(`
  create table if not exists blanwhi_store (
    store_key text primary key,
    store_value jsonb not null,
    updated_at timestamptz not null default now()
  )
`);

for (const [key, filename] of stores) {
  const file = path.join(rootDir, "data", filename);
  const value = JSON.parse(await readFile(file, "utf8"));
  await pool.query(
    `insert into blanwhi_store (store_key, store_value, updated_at)
     values ($1, $2::jsonb, now())
     on conflict (store_key)
     do update set store_value = excluded.store_value, updated_at = now()`,
    [key, JSON.stringify(value)]
  );
  console.log(`Imported ${filename} -> ${key}`);
}

await pool.end();
console.log("Done. BLANWHI data is now in Postgres.");
