import { Pool } from 'pg';
import 'server-only';

// Principio Singleton: Evita crear múltiples pools en desarrollo debido al Hot Reload de Next.js
const globalForDb = global as unknown as { pool: Pool };

export const pool = globalForDb.pool || new Pool({
  connectionString: process.env.POSTGRES_URL,
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
  
  console.log(`Query ejecutada en ${duration}ms: ${text}`);
  
  return res;
}