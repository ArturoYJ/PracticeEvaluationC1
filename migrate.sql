DO $$
BEGIN
    -- 1. Verificar Tabla Students
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students') THEN
        RAISE EXCEPTION 'Tabla students no existe';
    END IF;

    -- 2. Verificar Tabla Teachers
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teachers') THEN
        RAISE EXCEPTION 'Tabla teachers no existe';
    END IF;

    -- 3. Verificar Tabla Courses
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
        RAISE EXCEPTION 'Tabla courses no existe';
    END IF;

    -- 4. Verificar Tabla Groups
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'groups') THEN
        RAISE EXCEPTION 'Tabla groups no existe';
    END IF;

    -- 5. Verificar Tabla Enrollments
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enrollments') THEN
        RAISE EXCEPTION 'Tabla enrollments no existe';
    END IF;

    -- 6. Verificar Tabla Grades
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'grades') THEN
        RAISE EXCEPTION 'Tabla grades no existe';
    END IF;

    -- 7. Verificar Tabla Attendance
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attendance') THEN
        RAISE EXCEPTION 'Tabla attendance no existe';
    END IF;

    -- Mensaje de éxito
    RAISE NOTICE 'Migración completada: todas las tablas verificadas correctamente';
END $$;
