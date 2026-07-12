declare module "pg" {
  export class Pool {
    constructor(config?: {
      connectionString?: string;
      ssl?: false | { rejectUnauthorized?: boolean };
    });
    query<T = Record<string, unknown>>(
      text: string,
      params?: unknown[]
    ): Promise<{ rows: T[] }>;
  }
}
