-- 1. Crear el Rol de Aplicación (si no existe)
-- Las variables :app_db_user, :app_db_password, :postgres_db se pasan via psql -v
CREATE ROLE :app_db_user WITH LOGIN PASSWORD :'app_db_password';

-- 2. Limpieza de Permisos
REVOKE ALL ON DATABASE :postgres_db FROM :app_db_user;
REVOKE ALL ON SCHEMA public FROM :app_db_user;

-- 3. Permisos de Conexión Básica
GRANT CONNECT ON DATABASE :postgres_db TO :app_db_user;
GRANT USAGE ON SCHEMA public TO :app_db_user;

-- 4. LA REGLA DE ORO: Solo Vistas
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM :app_db_user;

GRANT SELECT ON vw_course_performance TO :app_db_user;
GRANT SELECT ON vw_teacher_load TO :app_db_user;
GRANT SELECT ON vw_students_at_risk TO :app_db_user;
GRANT SELECT ON vw_attendance_by_group TO :app_db_user;
GRANT SELECT ON vw_rank_students TO :app_db_user;
GRANT SELECT ON vw_courses_summary TO :app_db_user;
