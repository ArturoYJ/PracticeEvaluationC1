-- 1. Índices para Foreign Keys (PostgreSQL NO los crea automáticamente)
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_group_id ON enrollments(group_id);
CREATE INDEX idx_groups_course_id ON groups(course_id);

-- 2. Índices para Filtros Frecuentes (WHERE)
CREATE INDEX idx_groups_term ON groups(term);
CREATE INDEX idx_students_program ON students(program);

-- 3. Índices para Búsqueda (Search)
CREATE INDEX idx_students_email ON students(email);

-- EXPLAIN ANALYZE SELECT * FROM enrollments WHERE student_id = 5;