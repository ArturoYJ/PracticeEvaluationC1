-- Inyeccion asistida por IA - DATASET EXTENDIDO
-- Limpiamos datos previos para evitar duplicados al reiniciar
TRUNCATE TABLE attendance, grades, enrollments, groups, courses, teachers, students RESTART IDENTITY CASCADE;

-- 1. Insertar ESTUDIANTES (20 Estudiantes Variados)
INSERT INTO students (name, email, program, enrollment_year) VALUES
-- Ing. Software (Original + Nuevos)
('Ana Estrellada', 'ana@uni.edu', 'Ing. Software', 2023),   -- ID 1
('Beto Promedio', 'beto@uni.edu', 'Ing. Software', 2023),   -- ID 2
('Carlos Riesgo', 'carlos@uni.edu', 'Ing. Software', 2023), -- ID 3
('Diana Ausente', 'diana@uni.edu', 'Ing. Software', 2023),  -- ID 4
('Elena Civil', 'elena@uni.edu', 'Ing. Civil', 2023),       -- ID 5
('Fernando Frontend', 'fer@uni.edu', 'Ing. Software', 2024), -- ID 6
('Gabriela Git', 'gaby@uni.edu', 'Ing. Software', 2024),     -- ID 7
('Hector HTML', 'hector@uni.edu', 'Ing. Software', 2024),    -- ID 8
('Isabel Industria', 'isa@uni.edu', 'Ing. Industrial', 2023),-- ID 9
('Juan Java', 'juan@uni.edu', 'Ing. Software', 2022),        -- ID 10
('Karen Kernel', 'karen@uni.edu', 'Ing. Software', 2022),    -- ID 11
('Luis Linux', 'luis@uni.edu', 'Ing. Software', 2023),       -- ID 12
('Maria Manager', 'maria@uni.edu', 'Lic. Administración', 2023), -- ID 13
('Nicolas Node', 'nico@uni.edu', 'Ing. Software', 2024),     -- ID 14
('Oscar Operaciones', 'oscar@uni.edu', 'Ing. Industrial', 2024), -- ID 15
('Patricia Python', 'paty@uni.edu', 'Ing. Software', 2023),  -- ID 16
('Quentin Query', 'quentin@uni.edu', 'Ing. Software', 2023), -- ID 17
('Rosa React', 'rosa@uni.edu', 'Ing. Software', 2024),       -- ID 18
('Sergio Scrum', 'sergio@uni.edu', 'Ing. Software', 2022),   -- ID 19
('Tania Testing', 'tania@uni.edu', 'Ing. Software', 2023);   -- ID 20

-- 2. Insertar DOCENTES (5 Docentes)
INSERT INTO teachers (name, email) VALUES
('Alan Turing', 'alan@uni.edu'),      -- ID 1 (Fundamentos)
('Ada Lovelace', 'ada@uni.edu'),      -- ID 2 (BD)
('Grace Hopper', 'grace@uni.edu'),    -- ID 3 (Calculo, COBOL)
('Linus Torvalds', 'linus@uni.edu'),  -- ID 4 (Sistemas Operativos, Git)
('Margaret Hamilton', 'marga@uni.edu'); -- ID 5 (Ingeniería de Software)

-- 3. Insertar CURSOS (5 Cursos)
INSERT INTO courses (code, name, credits) VALUES
('SW-101', 'Fundamentos de Programación', 5), -- ID 1
('SW-201', 'Base de Datos Avanzada', 6),      -- ID 2
('MAT-500', 'Cálculo Diferencial', 4),        -- ID 3
('SW-300', 'Programación Orientada a Objetos', 5), -- ID 4
('ADM-101', 'Administración de Proyectos', 4);     -- ID 5

-- 4. Insertar GRUPOS (Oferta Académica Ampliada)
-- Periodo 2024-2 (Pasado)
INSERT INTO groups (course_id, teacher_id, term, group_code) VALUES
(1, 1, '2024-2', 'A'), -- ID 1: Fundamentos (Turing)
(2, 2, '2024-2', 'A'); -- ID 2: BD (Lovelace)

-- Periodo 2025-1 (Actual) - MAS OFERTA
INSERT INTO groups (course_id, teacher_id, term, group_code) VALUES
(1, 1, '2025-1', 'A'), -- ID 3: Fundamentos (Turing)
(2, 2, '2025-1', 'A'), -- ID 4: BD (Lovelace)
(3, 3, '2025-1', 'A'), -- ID 5: Cálculo (Hopper)
(4, 4, '2025-1', 'A'), -- ID 6: POO (Torvalds)
(5, 5, '2025-1', 'A'), -- ID 7: Admin Proyectos (Hamilton)
(1, 2, '2025-1', 'B'); -- ID 8: Fundamentos Grupo B (Lovelace) - Doble turno

-- Periodo 2025-2 (Futuro)
INSERT INTO groups (course_id, teacher_id, term, group_code) VALUES
(1, 2, '2025-2', 'B'), -- ID 9
(3, 3, '2025-2', 'A'); -- ID 10

-- 5. Insertar INSCRIPCIONES Y CALIFICACIONES (Masivo)
-- Helper function para enrollar y calificar rapido no existe en seed simple, asi que hacemos inserts directos.

-- 2024-2 Histórico (Ya finalizado)
INSERT INTO enrollments (student_id, group_id) VALUES
(19, 1), (20, 1), (10, 2), (11, 2); -- Algunos alumnos viejos

INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(1, 8.0, 8.5, 8.3), (2, 9.0, 9.5, 9.3),
(3, 7.0, 6.5, 6.8), (4, 10.0, 10.0, 10.0);

-- 2025-1 ACTUAL (El grueso de la data)

-- Grupo 3: Fundamentos A (Turing) - 5 Alumnos
INSERT INTO enrollments (student_id, group_id) VALUES (6, 3), (7, 3), (8, 3), (14, 3), (18, 3);
-- Calificaciones (Mezcla)
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(5, 9.0, 8.0, 8.5),   -- Fernando
(6, 10.0, 10.0, 10.0),-- Gabriela (Excelente)
(7, 5.0, 4.0, null),  -- Hector (Reprobando)
(8, 7.0, 7.5, 7.2),   -- Nicolas
(9, 8.5, 9.0, 8.8);   -- Rosa

-- Grupo 4: BD (Lovelace) - 4 Alumnos Avanzados
INSERT INTO enrollments (student_id, group_id) VALUES (1, 4), (16, 4), (17, 4), (19, 4);
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(10, 10.0, 9.8, 9.9), -- Ana (Siempre top)
(11, 8.0, 8.5, 8.3),  -- Paty
(12, 9.5, 9.0, 9.2),  -- Quentin
(13, 7.5, 8.0, 7.8);  -- Sergio

-- Grupo 5: Calculo (Hopper) - Ingenieros sufriendo
INSERT INTO enrollments (student_id, group_id) VALUES (5, 5), (9, 5), (15, 5), (3, 5);
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(14, 8.0, 7.0, 7.5),  -- Elena
(15, 9.0, 8.0, 8.5),  -- Isabel
(16, 6.0, 5.0, null), -- Oscar (En riesgo)
(17, 3.0, 2.0, null); -- Carlos (Muy mal)

-- Grupo 6: POO (Torvalds) - Grupo exigente
INSERT INTO enrollments (student_id, group_id) VALUES (2, 6), (10, 6), (11, 6), (12, 6);
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(18, 7.0, 7.5, 7.3), -- Beto
(19, 6.0, 6.5, 6.3), -- Juan (Apenas)
(20, 9.0, 9.5, 9.3), -- Karen
(21, 5.0, 5.0, null); -- Luis (Reprobando con Linus)

-- Grupo 7: Admin (Hamilton) - Mezcla de carreras
INSERT INTO enrollments (student_id, group_id) VALUES (13, 7), (15, 7), (9, 7);
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(22, 10.0, 9.5, 9.8), -- Maria (Es su area)
(23, 8.0, 8.5, 8.3),  -- Oscar
(24, 9.0, 9.0, 9.0);  -- Isabel

-- Grupo 8: Fundamentos B (Lovelace) - Rezagados y nuevos
INSERT INTO enrollments (student_id, group_id) VALUES (4, 8), (3, 8);
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(25, 6.0, 6.0, 6.0),     -- Diana
(26, 2.0, 0.0, null);    -- Carlos (Repite y reprueba de nuevo)

-- 6. Insertar ASISTENCIA (Generada para detectar riesgos)

-- Asistencia Perfecta para el Grupo 3 (Fundamentos) - Primeros 10 dias
INSERT INTO attendance (enrollment_id, date, present)
SELECT e.id, CURRENT_DATE - make_interval(days => s), true
FROM enrollments e
CROSS JOIN generate_series(0, 9) s
WHERE e.group_id = 3;

-- Carlos (Enrollment 17 en Calculo) -> NUNCA VA
INSERT INTO attendance (enrollment_id, date, present)
SELECT 17, CURRENT_DATE - make_interval(days => s), false
FROM generate_series(0, 9) s;

-- Diana (Enrollment 25 en Fundamentos B) -> Falta mucho
INSERT INTO attendance (enrollment_id, date, present)
SELECT 25, CURRENT_DATE - make_interval(days => s), (s % 3 = 0) -- Va 1 de cada 3 clases
FROM generate_series(0, 9) s;

-- Luis (Enrollment 21 en POO) -> Asistencia irregular
INSERT INTO attendance (enrollment_id, date, present)
SELECT 21, CURRENT_DATE - make_interval(days => s), (s % 2 = 0)
FROM generate_series(0, 9) s;

-- Grupo 9: Fundamentos B (Lovelace)
INSERT INTO enrollments (student_id, group_id) VALUES (6, 9), (7, 9);
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(27, 9.0, null, null), -- Fernando (Cursando)
(28, 8.5, null, null); -- Gabriela (Cursando)

-- Grupo 10: Calculo (Hopper)
INSERT INTO enrollments (student_id, group_id) VALUES (1, 10), (10, 10);
INSERT INTO grades (enrollment_id, partial1, partial2, final) VALUES
(29, 9.5, null, null), -- Ana
(30, 8.0, null, null); -- Juan