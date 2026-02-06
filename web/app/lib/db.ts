import { Pool } from 'pg';
import 'server-only';

// Construir connection string desde variables individuales (evita hardcodeo)
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB}`;

// Principio Singleton: Evita crear múltiples pools en desarrollo debido al Hot Reload de Next.js
const globalForDb = global as unknown as { pool: Pool };

export const pool = globalForDb.pool || new Pool({
  connectionString,
});

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool;

/**
 * Función helper para ejecutar queries de forma segura
 * @param text La query SQL (ej: 'SELECT * FROM views WHERE id = $1')
 * @param params Los parámetros para evitar SQL Injection
 */
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  return res;
}