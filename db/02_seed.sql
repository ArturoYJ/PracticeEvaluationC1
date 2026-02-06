-- Inyeccion asistida por IA
-- Limpiamos datos previos para evitar duplicados al reiniciar
TRUNCATE TABLE attendance, grades, enrollments, groups, courses, teachers, students RESTART IDENTITY CASCADE;

-- 1. Insertar ESTUDIANTES (Casos de prueba)
INSERT INTO students (name, email, program, enrollment_year) VALUES
('Ana Estrellada', 'ana@uni.edu', 'Ing. Software', 2023),   -- ID 1: La mejor
('Beto Promedio', 'beto@uni.edu', 'Ing. Software', 2023),   -- ID 2: Regular
('Carlos Riesgo', 'carlos@uni.edu', 'Ing. Software', 2023), -- ID 3: Reprueba materias
('Diana Ausente', 'diana@uni.edu', 'Ing. Software', 2023),  -- ID 4: Falta mucho
('Elena Civil', 'elena@uni.edu', 'Ing. Civil', 2023);       -- ID 5: Otra carrera (para probar filtros)

-- 2. Insertar DOCENTES
INSERT INTO teachers (name, email) VALUES
('Alan Turing', 'alan@uni.edu'),      -- ID 1
('Ada Lovelace', 'ada@uni.edu'),      -- ID 2
('Grace Hopper', 'grace@uni.edu');    -- ID 3

-- 3. Insertar CURSOS (El Menú)
INSERT INTO courses (code, name, credits) VALUES
('SW-101', 'Fundamentos de Programación', 5), -- ID 1
('SW-201', 'Base de Datos Avanzada', 6),      -- ID 2
('MAT-500', 'Cálculo Diferencial', 4);        -- ID 3

-- 4. Insertar GRUPOS (Oferta Académica) - MÚLTIPLES PERIODOS
-- Periodo 2024-2 (Pasado)
INSERT INTO groups (course_id, teacher_id, term, group_code) VALUES
(1, 1, '2024-2', 'A'), -- ID 1: Fundamentos con Turing
(2, 2, '2024-2', 'A'); -- ID 2: BD con Lovelace

-- Periodo 2025-1 (Actual)
INSERT INTO groups (course_id, teacher_id, term, group_code) VALUES
(1, 1, '2025-1', 'A'), -- ID 3: Fundamentos con Turing
(2, 2, '2025-1', 'A'), -- ID 4: BD con Lovelace
(3, 3, '2025-1', 'A'); -- ID 5: Cálculo con Hopper

-- Periodo 2025-2 (Futuro)
INSERT INTO groups (course_id, teacher_id, term, group_code) VALUES
(1, 2, '2025-2', 'B'), -- ID 6: Fundamentos con Lovelace
(3, 3, '2025-2', 'A'); -- ID 7: Cálculo con Hopper

-- 5. Insertar INSCRIPCIONES (Unir Alumnos a Grupos)
INSERT INTO enrollments (student_id, group_id) VALUES
-- PERIODO 2024-2
(1, 1), -- Ana en Fundamentos 2024-2 (ID: 1)
(2, 1), -- Beto en Fundamentos 2024-2 (ID: 2)
(5, 2), -- Elena en BD 2024-2 (ID: 3)
-- PERIODO 2025-1 (Más actividad aquí)
(1, 3), -- Ana en Fundamentos 2025-1 (ID: 4)
(2, 3), -- Beto en Fundamentos 2025-1 (ID: 5)
(3, 3), -- Carlos en Fundamentos 2025-1 (ID: 6)
(4, 3), -- Diana en Fundamentos 2025-1 (ID: 7)
(1, 4), -- Ana en BD 2025-1 (ID: 8)
(3, 4); -- Carlos en BD 2025-1 (ID: 9)

-- 6. Insertar CALIFICACIONES
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
-- PERIODO 2024-2 (Histórico)
(1, 9.5, 9.0, 9.3),  -- Ana en Fundamentos 2024-2
(2, 7.5, 7.0, 7.2),   -- Beto en Fundamentos 2024-2
(3, 8.0, 8.5, 8.2),   -- Elena en BD 2024-2
-- PERIODO 2025-1 (Actual)
(4, 10.0, 9.5, 9.8),  -- Ana en Fundamentos 2025-1: Sobresaliente
(5, 8.0, 7.5, 8.0),   -- Beto en Fundamentos 2025-1: Pasa bien
(6, 4.0, 5.0, null),  -- Carlos en Fundamentos 2025-1: REPROBANDO (Riesgo Académico)
(7, 9.0, 9.0, 9.0),   -- Diana en Fundamentos 2025-1: Pasa bien (pero asistencia baja)
(8, 10.0, 10.0, 10.0), -- Ana en BD 2025-1: Perfecta
(9, 3.5, 2.0, null);   -- Carlos en BD 2025-1: Muy mal también

-- 7. Insertar ASISTENCIA (para periodo 2025-1 solamente)
-- Ana (Enrollment 4) -> Asistencia Perfecta
INSERT INTO attendance (enrollment_id, date, present)
SELECT 4, CURRENT_DATE - make_interval(days => s), true
FROM generate_series(0, 9) s;

-- Carlos (Enrollment 6) -> Asistencia Irregular (50%)
INSERT INTO attendance (enrollment_id, date, present)
SELECT 6, CURRENT_DATE - make_interval(days => s), (s % 2 = 0)
FROM generate_series(0, 9) s;

-- Diana (Enrollment 7) -> ALERTA DE ASISTENCIA (20% - Solo 2 de 10)
INSERT INTO attendance (enrollment_id, date, present)
SELECT 7, CURRENT_DATE - make_interval(days => s), false 
FROM generate_series(0, 7) s; -- 8 Faltas
INSERT INTO attendance (enrollment_id, date, present) VALUES
(7, CURRENT_DATE - INTERVAL '8 days', true),
(7, CURRENT_DATE - INTERVAL '9 days', true);