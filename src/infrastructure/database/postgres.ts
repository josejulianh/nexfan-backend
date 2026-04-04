import { Pool, PoolClient } from "pg";
import { config } from "../../config/env";

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: config.db.maxConnections,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: config.env === "production" ? { rejectUnauthorized: true } : false,
});

pool.on("error", (err) => {
  console.error("PostgreSQL pool error:", err);
});

export const db = {
  query: (text: string, params?: unknown[]) => pool.query(text, params),
  getClient: (): Promise<PoolClient> => pool.connect(),
  transaction: async <T>(fn: (client: PoolClient) => Promise<T>): Promise<T> => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};

export const connectDB = async () => {
  const client = await pool.connect();
  console.log("PostgreSQL connected");
  client.release();
};
