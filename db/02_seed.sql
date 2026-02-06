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

-- 4. Insertar GRUPOS (Oferta Académica)
-- Periodo 2025-1
INSERT INTO groups (course_id, teacher_id, term, group_code) VALUES
(1, 1, '2025-1', 'A'), -- ID 1: Fundamentos con Turing
(2, 2, '2025-1', 'A'), -- ID 2: BD con Lovelace
(3, 3, '2025-1', 'A'); -- ID 3: Cálculo con Hopper

-- 5. Insertar INSCRIPCIONES (Unir Alumnos a Grupos)
-- Todos meten "Fundamentos" (Grupo 1) y "BD" (Grupo 2)
INSERT INTO enrollments (student_id, group_id) VALUES
-- Grupo 1: Fundamentos
(1, 1), -- Ana (ID Enrollment: 1)
(2, 1), -- Beto (ID Enrollment: 2)
(3, 1), -- Carlos (ID Enrollment: 3)
(4, 1), -- Diana (ID Enrollment: 4)
-- Grupo 2: BD
(1, 2), -- Ana (ID Enrollment: 5)
(3, 2); -- Carlos (ID Enrollment: 6) - Carlos repite la dosis de riesgo

-- 6. Insertar CALIFICACIONES (Aquí definimos el destino de cada uno)
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
-- GRUPO 1: Fundamentos
(1, 10.0, 9.5, 9.8),  -- Ana: Sobresaliente
(2, 8.0, 7.5, 8.0),   -- Beto: Pasa bien
(3, 4.0, 5.0, null),  -- Carlos: REPROBANDO (Riesgo Académico)
(4, 9.0, 9.0, 9.0),   -- Diana: Pasa bien (pero espera a ver su asistencia)
-- GRUPO 2: BD
(5, 10.0, 10.0, 10.0), -- Ana: Perfecta
(6, 3.5, 2.0, null);   -- Carlos: Muy mal en BD también

-- 7. Insertar ASISTENCIA (Generación Masiva Inteligente)
-- Usaremos una técnica "Pro" de SQL para no escribir 100 líneas.
-- Generaremos asistencias para los últimos 10 días.

-- Caso A: Ana (Enrollment 1) -> Asistencia Perfecta (10 días presente)
INSERT INTO attendance (enrollment_id, date, present)
SELECT 1, CURRENT_DATE - make_interval(days => s), true
FROM generate_series(0, 9) s;

-- Caso B: Carlos (Enrollment 3) -> Asistencia Irregular (5 faltas)
INSERT INTO attendance (enrollment_id, date, present)
SELECT 3, CURRENT_DATE - make_interval(days => s), (s % 2 = 0) -- True si es par, False si es impar
FROM generate_series(0, 9) s;

-- Caso C: Diana (Enrollment 4) -> ALERTA DE ASISTENCIA (Casi nunca va)
-- Solo fue 2 días de 10.
INSERT INTO attendance (enrollment_id, date, present)
SELECT 4, CURRENT_DATE - make_interval(days => s), false 
FROM generate_series(0, 7) s; -- 8 Faltas seguidas
-- Agregamos 2 asistencias para que no sea 0%
INSERT INTO attendance (enrollment_id, date, present) VALUES
(4, CURRENT_DATE - INTERVAL '8 days', true),
(4, CURRENT_DATE - INTERVAL '9 days', true);