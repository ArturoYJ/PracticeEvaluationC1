import { query } from './db';
import { 
  CoursePerformance, 
  TeacherLoad, 
  StudentAtRisk, 
  AttendanceByGroup, 
  RankedStudent, 
  CourseSummary 
} from './definitions';
import { unstable_noStore as noStore } from 'next/cache';
import { z } from 'zod';

// SCHEMAS DE VALIDACIÓN (ZOD)
// Validamos lo que entra desde la URL (searchParams) antes de tocar la BD
const TermSchema = z.string().regex(/^\d{4}-\d$/, "Formato inválido (ej: 2025-1)");
const PaginationSchema = z.coerce.number().int().positive(); // Convierte "1" a 1
const SearchSchema = z.string().max(100).optional(); // Evita strings gigantes

const ITEMS_PER_PAGE = 6;
const RANKING_LIMIT = 50;

// 1. RENDIMIENTO DEL CURSO
export async function fetchCoursePerformance(term: string): Promise<CoursePerformance[]> {
  // 1. Evitar caché estática
  noStore(); 

  // 2. Validación (Fail fast)
  const validatedTerm = TermSchema.safeParse(term);
  if (!validatedTerm.success) {
    console.error('Term inválido:', term);
    return []; // O lanzar error, según prefieras
  }

  try {
    // 3. Query Parametrizada (Seguridad contra SQL Injection)
    const result = await query(
      `SELECT * FROM vw_course_performance WHERE term = $1 ORDER BY failure_rate DESC`,
      [term]
    );

    // 4. Mapeo y Casting (String -> Number)
    return result.rows.map(row => ({
      ...row,
      total_students: Number(row.total_students),
      average_score: Number(row.average_score),
      failed_count: Number(row.failed_count),
      failure_rate: Number(row.failure_rate),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al cargar rendimiento de cursos.');
  }
}

// 2. CARGA DOCENTE (Con Paginación)
export async function fetchTeacherLoad(
  term: string,
  currentPage: number
): Promise<{ data: TeacherLoad[], totalPages: number }> {
  noStore();
  
  if (!TermSchema.safeParse(term).success) return { data: [], totalPages: 0 };

  const page = PaginationSchema.safeParse(currentPage).success ? currentPage : 1;
  const offset = (page - 1) * ITEMS_PER_PAGE;

  try {
    // 1. Data Paginada
    const dataPromise = query(
      `SELECT * FROM vw_teacher_load 
       WHERE term = $1 
       ORDER BY total_students_served DESC
       LIMIT $2 OFFSET $3`,
      [term, ITEMS_PER_PAGE, offset]
    );

    // 2. Conteo Total (para paginación)
    const countPromise = query(
      `SELECT COUNT(*) FROM vw_teacher_load WHERE term = $1`,
      [term]
    );

    const [dataResult, countResult] = await Promise.all([dataPromise, countPromise]);

    const totalItems = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const data = dataResult.rows.map(row => ({
      ...row,
      active_groups: Number(row.active_groups),
      total_students_served: Number(row.total_students_served),
      avg_grading_strictness: Number(row.avg_grading_strictness),
    }));

    return { data, totalPages };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al cargar carga docente.');
  }
}

// 3. ALUMNOS EN RIESGO (Con Paginación y Búsqueda)
export async function fetchStudentsAtRisk(
  queryText: string, 
  currentPage: number
): Promise<{ data: StudentAtRisk[], totalPages: number }> {
  noStore();

  // Validación de parámetros
  const validatedSearch = SearchSchema.safeParse(queryText);
  const validatedPage = PaginationSchema.safeParse(currentPage);
  
  const safeQueryText = validatedSearch.success ? validatedSearch.data || '' : '';
  const safePage = validatedPage.success ? validatedPage.data : 1;

  const offset = (safePage - 1) * ITEMS_PER_PAGE;
  // Búsqueda flexible (insensitive case)
  const searchTerm = `%${safeQueryText}%`; 

  try {
    // Query 1: Obtener datos paginados
    const dataPromise = query(
      `SELECT * FROM vw_students_at_risk 
       WHERE name ILIKE $1 OR email ILIKE $1
       ORDER BY attendance_pct ASC, final_grade ASC
       LIMIT $2 OFFSET $3`,
      [searchTerm, ITEMS_PER_PAGE, offset]
    );

    // Query 2: Contar total para saber cuántas páginas hay
    const countPromise = query(
      `SELECT COUNT(*) FROM vw_students_at_risk 
       WHERE name ILIKE $1 OR email ILIKE $1`,
      [searchTerm]
    );

    // Ejecutar en paralelo para velocidad
    const [dataResult, countResult] = await Promise.all([dataPromise, countPromise]);

    const totalItems = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const data = dataResult.rows.map(row => ({
      ...row,
      final_grade: Number(row.final_grade),
      attendance_pct: Number(row.attendance_pct),
      // TypeScript ya valida que risk_reason coincida con el Union Type si la BD está bien
    }));

    return { data, totalPages };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al buscar alumnos en riesgo.');
  }
}

// 4. ASISTENCIA POR GRUPO
export async function fetchAttendanceByGroup(term: string): Promise<AttendanceByGroup[]> {
  noStore();
  
  // Si no hay term, devolvemos vacío o el más reciente por defecto
  if (!term) return [];

  try {
    const result = await query(
      `SELECT * FROM vw_attendance_by_group WHERE term = $1 ORDER BY group_attendance_rate ASC`,
      [term]
    );

    return result.rows.map(row => ({
      ...row,
      enrolled_students: Number(row.enrolled_students),
      group_attendance_rate: Number(row.group_attendance_rate),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al cargar asistencia por grupo.');
  }
}

// 5. RANKING DE ESTUDIANTES (Filtro por Programa)
export async function fetchRankedStudents(program?: string): Promise<RankedStudent[]> {
  noStore();

  try {
    let queryString = `SELECT * FROM vw_rank_students`;
    let params: any[] = [];

    // Filtro dinámico: Si viene programa, lo filtramos, si no, traemos todos
    if (program && program.toLowerCase() !== 'todos') {
      queryString += ` WHERE program = $1`;
      params.push(program);
    }
    
    queryString += ` ORDER BY program, ranking_in_program ASC LIMIT ${RANKING_LIMIT}`;

    const result = await query(queryString, params);

    return result.rows.map(row => ({
      ...row,
      global_average: Number(row.global_average),
      ranking_in_program: Number(row.ranking_in_program),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al cargar ranking.');
  }
}

// 6. RESUMEN DASHBOARD (vw_courses_summary)
export async function fetchCoursesSummary(): Promise<CourseSummary[]> {
  noStore();
  try {
    const result = await query(`SELECT * FROM vw_courses_summary ORDER BY course_name ASC`);
    return result.rows.map(row => ({
      ...row,
      credits: Number(row.credits),
      total_groups: Number(row.total_groups),
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al cargar resumen del dashboard.');
  }
}

// HELPERS PARA FILTROS (Dropdowns)
export async function fetchTerms() {
  noStore();
  try {
    // Hacemos una query ligera a la tabla groups para saber qué periodos existen
    const result = await query(`SELECT DISTINCT term FROM groups ORDER BY term DESC`);
    return result.rows.map(row => row.term as string);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al cargar periodos.');
  }
}

export async function fetchPrograms() {
  noStore();
  try {
    const result = await query(`SELECT DISTINCT program FROM students ORDER BY program ASC`);
    return result.rows.map(row => row.program as string);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Error al cargar programas.');
  }
}