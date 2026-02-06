# School Reporting Dashboard (AWOS Evaluation)

App en Next.js (TypeScript) que visualiza reportes SQL avanzados obtenidos desde VIEWS en PostgreSQL, corriendo sobre Docker con seguridad implementada.

## 🚀 Requisitos Previos

- Docker Desktop
- Git

## 🛠️ Cómo Correr el Proyecto

1. **Clonar el repositorio:**

   ```bash
   git clone <URL_DEL_REPO>
   cd awos-eva-practice_c1
   ```

2. **Iniciar con Docker Compose:**

   ```bash
   docker compose up --build
   ```

3. **Acceder a la App:**
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

**Ejemplo 1: Búsqueda de alumnos en riesgo**

```sql
EXPLAIN ANALYZE SELECT * FROM vw_students_at_risk WHERE email = 'student@test.com';
```

_Resultado esperado:_ Uso de `Index Scan` sobre `idx_students_email`.

**Ejemplo 2: Filtrado de grupos por periodo**

```sql
EXPLAIN ANALYZE SELECT * FROM groups WHERE term = '2025-1';
```

_Resultado esperado:_ Uso de `Bitmap Heap Scan` usando `idx_groups_term`.

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
