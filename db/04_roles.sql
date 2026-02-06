-- 1. Crear el Rol de Aplicación
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'app_client') THEN
      CREATE ROLE app_client WITH LOGIN PASSWORD 'secure_pass_123';
   END IF;
END
$do$;

-- 2. Limpieza de Permisos|
REVOKE ALL ON DATABASE school_db FROM app_client;
REVOKE ALL ON SCHEMA public FROM app_client;

-- 3. Permisos de Conexión Básica
GRANT CONNECT ON DATABASE school_db TO app_client;
GRANT USAGE ON SCHEMA public TO app_client;

-- 4. LA REGLA DE ORO: Solo Vistas
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_client;

GRANT SELECT ON vw_course_performance TO app_client;
GRANT SELECT ON vw_teacher_load TO app_client;
GRANT SELECT ON vw_students_at_risk TO app_client;
GRANT SELECT ON vw_attendance_by_group TO app_client;
GRANT SELECT ON vw_rank_students TO app_client;
GRANT SELECT ON vw_courses_summary TO app_client;