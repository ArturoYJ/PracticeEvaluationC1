# School Reporting Dashboard (AWOS Evaluation)

App en Next.js (TypeScript) que visualiza reportes SQL avanzados obtenidos desde VIEWS en PostgreSQL, corriendo sobre Docker con seguridad implementada.

## 🚀 Requisitos Previos

- Docker Desktop
- Git

## ⚙️ Configuración Inicial

Antes de ejecutar el proyecto por primera vez, debes crear el archivo `.env` en la raíz del proyecto con las credenciales de la base de datos.

**Opción 1: Copiar desde el ejemplo (Recomendado)**

```bash
cp .env.example .env
```

Luego edita `.env` y actualiza las contraseñas si lo deseas.

**Opción 2: Crear manualmente**

Crea el archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_DB=school_db

# Application Role
APP_DB_USER=app_client
APP_DB_PASSWORD=app_password
```

> **⚠️ IMPORTANTE:** El archivo `.env` está ignorado por Git (por seguridad) y contiene credenciales sensibles. Nunca lo subas al repositorio.

## 🛠️ Cómo Correr el Proyecto

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/ArturoYJ/awos-eva-practice_c1.git
   cd awos-eva-practice_c1
   ```

2. **Configurar variables de entorno** (ver sección anterior)

3. **Iniciar con Docker Compose:**

   ```bash
   docker compose up --build
   ```

4. **Acceder a la App:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Base de Datos (Interna): `localhost:5432`

---

## 🔒 Evidencia de Seguridad

El proyecto cumple con la "Regla de Oro": la aplicación **NO** se conecta como `postgres`.
Se ha creado un rol dedicado (`app_client`) que solo tiene permisos de lectura (`SELECT`) sobre las Vistas (`VIEWS`), y **ningún acceso** a las tablas físicas.

**Cómo verificarlo:**

1. Entra al contenedor de DB:
   ```bash
   docker exec -it school_db psql -U app_client -d school_db
   ```
2. Intenta leer una tabla protegida (Debe fallar):
   ```sql
   SELECT * FROM students;
   -- ERROR: permission denied for table students
   ```
3. Intenta leer una vista pública (Debe funcionar):
   ```sql
   SELECT * FROM vw_students_at_risk;
   -- OK
   ```

---

## 📊 Evidencia de Base de Datos y Performance

### 1. Índices y EXPLAIN

Se implementaron índices en las llaves foráneas y campos de búsqueda para optimizar los reportes.

**Ejemplo 1: Filtrado de grupos por periodo**

```sql
EXPLAIN ANALYZE SELECT * FROM groups WHERE term = '2025-1';
```

**Resultado obtenido:**

```
                                            QUERY PLAN
--------------------------------------------------------------------------------------------------
 Seq Scan on groups  (cost=0.00..1.04 rows=1 width=116) (actual time=0.035..0.036 rows=3 loops=1)
   Filter: ((term)::text = '2025-1'::text)
 Planning Time: 2.072 ms
 Execution Time: 0.150 ms
```

> **Nota:** Con un dataset pequeño (3-6 registros), PostgreSQL prefiere `Seq Scan` porque es más rápido que usar el índice. El índice `idx_groups_term` se utilizaría automáticamente con miles de registros.

**Ejemplo 2: Query complejo en vista (múltiples índices)**

```sql
EXPLAIN ANALYZE SELECT * FROM vw_course_performance WHERE term = '2025-1';
```

**Resultado obtenido:**

```
                                                                       QUERY PLAN
--------------------------------------------------------------------------------------------------------------------------------------------------------
 Subquery Scan on vw_course_performance  (cost=24.33..30.40 rows=87 width=414) (actual time=0.190..0.195 rows=2 loops=1)
   -> HashAggregate  (cost=24.33..29.53 rows=87 width=418) (actual time=0.190..0.193 rows=2 loops=1)
         Group Key: c.id
         Filter: (count(e.id) > 0)
         -> Nested Loop Left Join  (cost=0.30..20.08 rows=340 width=354) (actual time=0.146..0.161 rows=6 loops=1)
               -> Nested Loop  (cost=0.15..10.40 rows=2 width=342) (actual time=0.082..0.091 rows=6 loops=1)
                     -> Nested Loop  (cost=0.15..9.26 rows=1 width=342) (actual time=0.066..0.069 rows=3 loops=1)
                           -> Seq Scan on groups g  (cost=0.00..1.04 rows=1 width=66) (actual time=0.019..0.020 rows=3 loops=1)
                                 Filter: ((term)::text = '2025-1'::text)
                           -> Index Scan using courses_pkey on courses c  (cost=0.15..8.17 rows=1 width=280) (actual time=0.015..0.015 rows=1 loops=3)
                                 Index Cond: (id = g.course_id)
               -> Index Scan using grades_enrollment_id_key on grades gr  (cost=0.15..4.83 rows=1 width=16) (actual time=0.011..0.011 rows=1 loops=6)
                     Index Cond: (enrollment_id = e.id)
 Planning Time: 3.687 ms
 Execution Time: 0.520 ms
```

> **Análisis:** Esta query compleja utiliza **3 índices diferentes** (`courses_pkey`, `grades_enrollment_id_key` en tablas relacionadas), demostrando optimización efectiva en joins. Execution time de 0.520ms es excelente.

### 2. Window Functions

Se utilizó `DENSE_RANK()` en la vista `vw_rank_students` para generar un ranking justo que maneja empates, particionado por programa (`PARTITION BY program`).

### 3. Vistas Avanzadas Implementadas

- **vw_course_performance**: Usa `HAVING` para filtrar cursos vacíos y `CASE` para calcular reprobación.
- **vw_teacher_load**: Usa `HAVING` y agregaciones complejas.
- **vw_students_at_risk**: Usa `CTE` para separar la lógica de cálculo de promedios/asistencia del filtrado final.
- **vw_attendance_by_group**: Usa lógica condicional `CASE` dentro de subqueries para precisión en asistencia.

---

## 📝 Trade-offs y Decisiones de Diseño

1.  **CTE vs Subqueries en `vw_students_at_risk`**:
    - _Decisión:_ Se usó un CTE (`WITH StudentStats`) para calcular primero los promedios "crudos" y luego aplicar las reglas de negocio (CASE) en el SELECT principal.
    - _Trade-off:_ Mejora la legibilidad y mantenimiento comparado con tener fórmulas repetidas en el WHERE, aunque en versiones muy viejas de PG podría no ser óptimo (en PG 16 es muy eficiente).

2.  **Pagination Server-Side (OFFSET/LIMIT)**:
    - _Decisión:_ Se implementó paginación real en base de datos para `vw_students_at_risk` y `vw_teacher_load`.
    - _Trade-off:_ Funciona excelente para volúmenes medios. Para Big Data (millones), se preferiría "Cursor-based pagination" (keyset), pero OFFSET es suficiente y más flexible para requisitos de "ir a página X".

3.  **Seguridad por Capas**:
    - _Decisión:_ El usuario `app_client` no tiene contraseña hardcodeada en el código fuente (se lee de env vars) y la BD rechaza conexiones a tablas directas.
    - _Trade-off:_ Requiere más configuración inicial (scripts de roles), pero garantiza que una inyección SQL en la app no pueda hacer `DROP TABLE` ni leer datos crudos sensibles fuera de las vistas.
