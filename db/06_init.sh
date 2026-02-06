#!/bin/bash
set -e

# Este script ejecuta 04_roles.sql.template con variables de entorno usando psql -v

echo "Ejecutando 04_roles.sql.template con variables de entorno..."

# Verificar si el rol ya existe, si no, ejecutar el script
ROLE_EXISTS=$(psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT 1 FROM pg_roles WHERE rolname='$APP_DB_USER'")

if [ "$ROLE_EXISTS" != "1" ]; then
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
        -v app_db_user="$APP_DB_USER" \
        -v app_db_password="$APP_DB_PASSWORD" \
        -v postgres_db="$POSTGRES_DB" \
        -f /docker-entrypoint-initdb.d/04_roles.sql.template
    echo "Roles creados exitosamente."
else
    echo "El rol $APP_DB_USER ya existe, saltando creacion."
fi
