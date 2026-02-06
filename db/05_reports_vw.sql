DROP VIEW IF EXISTS vw_courses_summary;
DROP VIEW IF EXISTS vw_rank_students;
DROP VIEW IF EXISTS vw_attendance_by_group;
DROP VIEW IF EXISTS vw_students_at_risk;
DROP VIEW IF EXISTS vw_teacher_load;
DROP VIEW IF EXISTS vw_course_performance;

-- 1. RENDIMIENTO DEL CURSO (Requisito: Agregados + CASE + HAVING)
-- Descripción: Muestra métricas de aprobación por curso y periodo.
-- Grain: 1 fila por Curso y Periodo.
-- Métricas: Total alumnos, Promedio de notas, Tasa de reprobación.
-- Requisito cumplido: CASE , HAVING 
-- VERIFY: SELECT * FROM vw_course_performance WHERE failure_rate > 20; 
CREATE VIEW vw_course_performance AS
SELECT 
    c.name AS course_name,
    c.code AS course_code,
    g.term,
    COUNT(e.id) as total_students,
    -- KPI 1: Promedio General
    ROUND(AVG(COALESCE(gr.final, 0)), 2) as average_score,
    -- KPI 2: Conteo de Reprobados
    SUM(CASE WHEN COALESCE(gr.final, 0) < 6 THEN 1 ELSE 0 END) as failed_count,
    -- KPI 3: Porcentaje de Reprobación
    ROUND(
        (SUM(CASE WHEN COALESCE(gr.final, 0) < 6 THEN 1 ELSE 0 END)::decimal / COUNT(e.id)) * 100, 
    2) as failure_rate
FROM courses c
JOIN groups g ON c.id = g.course_id
JOIN enrollments e ON g.id = e.group_id
LEFT JOIN grades gr ON e.id = gr.enrollment_id
GROUP BY c.name, g.term, c.id, c.code
HAVING COUNT(e.id) > 0;

-- 2. CARGA DOCENTE (Requisito: HAVING)
-- Descripción: Muestra qué tan cargado está un docente de trabajo.
-- Grain: 1 fila por Docente y Periodo.
-- Requisito cumplido: HAVING 
-- VERIFY: SELECT * FROM vw_teacher_load WHERE avg_grading_strictness < 7; 
CREATE VIEW vw_teacher_load AS
SELECT 
    t.name as teacher_name,
    t.email,
    g.term,
    COUNT(DISTINCT g.id) as active_groups,
    COUNT(e.id) as total_students_served,
    -- Promedio de severidad al calificar
    ROUND(AVG(gr.final), 2) as avg_grading_strictness
FROM teachers t
JOIN groups g ON t.id = g.teacher_id
JOIN enrollments e ON g.id = e.group_id
LEFT JOIN grades gr ON e.id = gr.enrollment_id
GROUP BY t.id, t.name, t.email, g.term
HAVING COUNT(e.id) > 0; -- REQUISITO HAVING #2: Solo docentes activos

-- 3. ALUMNOS EN RIESGO (Requisito: CTE - Common Table Expression)
-- Descripción: Identifica alumnos con problemas de notas o asistencia.
-- Grain: 1 fila por Alumno en Riesgo.
-- Requisito cumplido: CTE 
-- VERIFY: SELECT * FROM vw_students_at_risk WHERE risk_reason LIKE 'CRÍTICO%'; 
CREATE VIEW vw_students_at_risk AS
WITH StudentStats AS (
    -- CTE: Pre-cálculo de métricas crudas
    SELECT 
        e.student_id,
        s.name,
        s.email,
        c.name as course_name,
        COALESCE(gr.final, 0) as final_grade,
        -- Cálculo complejo de % Asistencia
        (COUNT(CASE WHEN a.present THEN 1 END)::decimal / NULLIF(COUNT(a.id), 0)) * 100 as attendance_pct
    FROM enrollments e
    JOIN students s ON e.student_id = s.id
    JOIN groups g ON e.group_id = g.id
    JOIN courses c ON g.course_id = c.id
    LEFT JOIN grades gr ON e.id = gr.enrollment_id
    LEFT JOIN attendance a ON e.id = a.enrollment_id
    GROUP BY e.id, s.id, c.id, gr.final
)
SELECT 
    name,
    email,
    course_name,
    final_grade,
    ROUND(attendance_pct, 1) as attendance_pct,
    CASE 
        WHEN final_grade < 6 AND attendance_pct < 75 THEN 'CRÍTICO: Académico y Asistencia'
        WHEN final_grade < 6 THEN 'Riesgo Académico'
        WHEN attendance_pct < 75 THEN 'Riesgo Asistencia'
    END as risk_reason
FROM StudentStats
WHERE final_grade < 6 OR attendance_pct < 75;

-- 4. ASISTENCIA POR GRUPO (Requisito: CASE/COALESCE significativo)
-- Descripción: Resumen de asistencia promedio por grupo.
-- Grain: 1 fila por Grupo.
-- Requisito cumplido: COALESCE/CASE significativo 
-- VERIFY: SELECT * FROM vw_attendance_by_group WHERE group_attendance_rate < 80; 
CREATE VIEW vw_attendance_by_group AS
SELECT 
    c.name as course,
    g.term,
    t.name as teacher,
    COUNT(DISTINCT e.id) as enrolled_students,
    -- KPI: Tasa de asistencia del grupo
    ROUND(
        AVG(
            CASE 
                WHEN (SELECT COUNT(*) FROM attendance a3 WHERE a3.enrollment_id = e.id) = 0 THEN 0
                ELSE 
                    (SELECT COUNT(*) FROM attendance a2 WHERE a2.enrollment_id = e.id AND a2.present = true)::decimal / 
                    (SELECT COUNT(*) FROM attendance a3 WHERE a3.enrollment_id = e.id)
            END
        ) * 100, 
    2) as group_attendance_rate
FROM groups g
JOIN courses c ON g.course_id = c.id
JOIN teachers t ON g.teacher_id = t.id
JOIN enrollments e ON g.id = e.group_id
GROUP BY g.id, c.name, t.name, g.term;

-- 5. RANKING DE ESTUDIANTES (Requisito: Window Function)
-- Descripción: Ranking de mejores promedios por carrera.
-- Grain: 1 fila por Estudiante.
-- Requisito cumplido: Window Function (DENSE_RANK) 
-- VERIFY: SELECT * FROM vw_rank_students WHERE ranking_in_program <= 3; 
CREATE VIEW vw_rank_students AS
SELECT 
    s.program,
    s.name,
    s.enrollment_year,
    ROUND(AVG(gr.final), 2) as global_average,
    -- WINDOW FUNCTION: Ranking particionado por programa
    DENSE_RANK() OVER (
        PARTITION BY s.program 
        ORDER BY AVG(gr.final) DESC NULLS LAST
    ) as ranking_in_program
FROM students s
JOIN enrollments e ON s.id = e.student_id
JOIN grades gr ON e.id = gr.enrollment_id
GROUP BY s.id
ORDER BY s.program, ranking_in_program;

-- 6. RESUMEN DE CURSOS (Vista sencilla para catálogo)
-- Descripción: Muestra cursos con su cantidad de grupos activos.
-- Grain: 1 fila por Curso.
-- Requisito cumplido: LEFT JOIN + COUNT agregado
CREATE VIEW vw_courses_summary AS
SELECT 
    c.id as course_id,
    c.code,
    c.name as course_name,
    c.credits,
    COUNT(g.id) as total_groups
FROM courses c
LEFT JOIN groups g ON c.id = g.course_id
GROUP BY c.id, c.code, c.name, c.credits
ORDER BY c.name;
