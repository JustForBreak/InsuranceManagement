// src/lib/db.ts
import { Pool } from 'pg';

// Read individual variables (the ones you already have in .env.local)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'insurance_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD, // ← this is now the string "1234"
  // Remove ssl for local development (Railway will override this in production anyway)
  ...(process.env.NODE_ENV === 'production' && {
    ssl: { rejectUnauthorized: false },
  }),
});

// Optional: nice logs so you know it works
pool.on('connect', () => console.log('Connected to PostgreSQL'));
pool.on('error', (err) => console.error('DB error:', err.message));

export { pool };
export default pool;
