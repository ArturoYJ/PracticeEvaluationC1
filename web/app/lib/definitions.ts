// 1. Rendimiento de Cursos (vw_course_performance)
export interface CoursePerformance {
  course_name: string;
  course_code: string;
  term: string;
  total_students: number; 
  average_score: number;  
  failed_count: number;
  failure_rate: number; // Es un porcentaje
}

// 2. Carga Docente (vw_teacher_load)
export interface TeacherLoad {
  teacher_name: string;
  email: string;
  term: string;
  active_groups: number;
  total_students_served: number;
  avg_grading_strictness: number; // Promedio de notas que pone el profe
}

// 3. Alumnos en Riesgo (vw_students_at_risk)
export interface StudentAtRisk {
  name: string;
  email: string;
  course_name: string;
  final_grade: number;
  attendance_pct: number;
  // Union Type estricto para coincidir con los CASE de tu SQL
  risk_reason: 
    | 'CRÍTICO: Académico y Asistencia' 
    | 'Riesgo Académico' 
    | 'Riesgo Asistencia';
}

// 4. Asistencia por Grupo (vw_attendance_by_group)
export interface AttendanceByGroup {
  course: string;
  term: string;
  teacher: string;
  enrolled_students: number;
  group_attendance_rate: number; // Porcentaje 0-100
}

// 5. Ranking de Estudiantes (vw_rank_students)
export interface RankedStudent {
  program: string;
  name: string;
  enrollment_year: number;
  global_average: number;
  ranking_in_program: number; // 1, 2, 3...
}

// 6. Resumen de Cursos (vw_courses_summary)
export interface CourseSummary {
  course_id: number;
  code: string;
  course_name: string;
  credits: number;
  total_groups: number;
}