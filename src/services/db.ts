import { Pool } from 'pg';

let pool: Pool | null = null;

export const getPool = (): Pool | null => {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
};

export const isDbAvailable = (): boolean => !!process.env.DATABASE_URL;

/** Creates the price_snapshots table if it doesn't exist yet */
export const initSchema = async (): Promise<void> => {
  const db = getPool();
  if (!db) return;
  await db.query(`
    CREATE TABLE IF NOT EXISTS price_snapshots (
      id          SERIAL PRIMARY KEY,
      brand       TEXT NOT NULL,
      fuel_type   TEXT NOT NULL,
      price       NUMERIC(6,3) NOT NULL,
      recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
      UNIQUE (brand, fuel_type, recorded_at)
    )
  `);
};
