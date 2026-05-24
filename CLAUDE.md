# Panel Admin — bohdeveloper.com

## Contexto del proyecto

Portfolio personal de Borja (Olazabal-Hernandez Borja), fullstack developer en Inetum, Donostia.
Stack actual: Next.js + Cloudflare Pages + Cloudflare Workers + D1.
El portfolio público ya existe en bohdeveloper.com.
Este panel admin es un espacio privado accesible solo por el propietario, extensible con múltiples herramientas/apps en el futuro.

## Objetivo de esta tarea

Implementar un panel admin privado en `/admin` con:
1. Sistema de autenticación JWT (usuario + contraseña, un solo usuario: el admin)
2. Ruta protegida `/admin/dashboard` con navegación lateral extensible
3. Primera herramienta integrada: Tracker de Transformación Integral (archivo `tracker.html` ya existe en el proyecto)
4. Backend en Cloudflare Workers + D1, preparado para escalar con más herramientas

## Arquitectura objetivo

```
bohdeveloper.com/
├── (portfolio público — no tocar)
├── /admin
│   ├── /login        → formulario login (público)
│   └── /dashboard    → panel privado (protegido por JWT)
│       └── /tracker  → Tracker de rutina semanal

Cloudflare Workers (API):
├── POST /api/auth/login     → valida credenciales, devuelve JWT en httpOnly cookie
├── POST /api/auth/logout    → limpia cookie
├── GET  /api/auth/me        → verifica sesión activa
├── GET  /api/tracker/week   → devuelve registros de la semana
├── POST /api/tracker/save   → guarda actividad (completada/perdida + motivo)
└── GET  /api/tracker/stats  → estadísticas mensuales/trimestrales/anuales

Cloudflare D1 (base de datos):
├── tabla: admin_users       → credenciales del admin
└── tabla: tracker_records   → registros de actividades del tracker
```

## Instrucciones paso a paso para Claude Code

### PASO 1 — Verificar estructura del proyecto
- Listar archivos en la raíz del proyecto
- Confirmar que existe `wrangler.toml` (configuración Cloudflare)
- Identificar si el proyecto usa Pages Functions o un Worker separado
- Leer `package.json` para confirmar dependencias actuales

### PASO 2 — Crear base de datos D1
Ejecutar en terminal:
```bash
npx wrangler d1 create bohdeveloper-admin
```
Añadir el binding resultante a `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "bohdeveloper-admin"
database_id = "ID_QUE_DEVUELVA_EL_COMANDO"
```

### PASO 3 — Crear schema SQL
Crear archivo `schema.sql`:
```sql
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tracker_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  activity_id TEXT NOT NULL,
  day_index INTEGER NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, activity_id)
);

CREATE TABLE IF NOT EXISTS tracker_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
Ejecutar:
```bash
npx wrangler d1 execute bohdeveloper-admin --file=schema.sql
```

### PASO 4 — Crear usuario admin
Generar hash bcrypt de la contraseña elegida por el usuario y ejecutar:
```bash
npx wrangler d1 execute bohdeveloper-admin --command="INSERT INTO admin_users (username, password_hash) VALUES ('borja', 'HASH_AQUI')"
```
IMPORTANTE: Pedir al usuario su contraseña deseada, hashearla con bcrypt (rounds: 12), nunca guardarla en texto plano.

### PASO 5 — Crear Worker de autenticación
Crear `functions/api/auth/login.js` (Pages Functions):
- Recibir `{username, password}` en POST
- Verificar contra D1 con bcrypt.compare
- Si válido: generar JWT firmado con `JWT_SECRET` (variable de entorno)
- Devolver JWT en cookie `httpOnly; Secure; SameSite=Strict; Max-Age=604800` (7 días)
- Si inválido: devolver 401

Crear `functions/api/auth/logout.js`:
- Limpiar cookie estableciendo Max-Age=0

Crear `functions/api/auth/me.js`:
- Leer cookie, verificar JWT
- Devolver `{ok: true, username}` o 401

### PASO 6 — Middleware de protección
Crear `functions/admin/_middleware.js`:
- Interceptar todas las rutas bajo `/admin/`
- Excluir `/admin/login`
- Verificar JWT en cookie en cada request
- Si inválido: redirigir a `/admin/login`

### PASO 7 — Crear páginas admin en Next.js
Crear las siguientes rutas/páginas:
- `app/admin/login/page.tsx` — formulario login minimalista (modo oscuro, coherente con el portfolio)
- `app/admin/dashboard/page.tsx` — layout con sidebar lateral extensible
- `app/admin/dashboard/tracker/page.tsx` — integra el tracker HTML como iframe o componente React

El sidebar debe ser extensible: array de `{name, path, icon}` para añadir herramientas futuras fácilmente.

### PASO 8 — APIs del tracker
Crear `functions/api/tracker/save.js`:
- Recibir `{date, activity_id, day_index, done, reason}`
- Verificar JWT (middleware ya lo cubre, pero validar igualmente)
- Upsert en D1: `INSERT OR REPLACE INTO tracker_records ...`

Crear `functions/api/tracker/week.js`:
- Recibir query param `?start=YYYY-MM-DD`
- Devolver todos los registros de esa semana desde D1

Crear `functions/api/tracker/stats.js`:
- Recibir query param `?period=monthly|quarterly|yearly&date=YYYY-MM-DD`
- Calcular agregaciones desde D1 y devolver JSON con cumplimiento por categoría y por día

### PASO 9 — Adaptar tracker.html
- El archivo `tracker.html` ya existe en el proyecto
- Modificar las funciones `loadState` y `saveState` para que usen fetch a `/api/tracker/week` y `/api/tracker/save` en lugar de localStorage
- Las demás funciones de renderizado no necesitan cambios

### PASO 10 — Variables de entorno
Añadir en Cloudflare Dashboard (Settings → Environment Variables):
```
JWT_SECRET=string_aleatorio_minimo_32_chars
```
También en `.dev.vars` para desarrollo local (este archivo va en .gitignore):
```
JWT_SECRET=tu_secreto_local
```

### PASO 11 — Despliegue
```bash
npx wrangler pages deploy
```
Verificar que:
- `/admin/login` es accesible sin autenticación
- `/admin/dashboard` redirige a login si no hay sesión
- El tracker carga y guarda datos correctamente en D1

## Notas importantes para Claude Code

- NO modificar ningún archivo del portfolio público existente
- El sidebar del dashboard debe diseñarse desde el inicio como un sistema de módulos: cada herramienta futura será un elemento más del array de navegación
- Usar TypeScript en todo el código nuevo
- Las Pages Functions deben manejar CORS correctamente para el dominio
- bcrypt debe importarse como `bcryptjs` (compatible con Workers, sin dependencias nativas)
- JWT: usar la librería `jose` (compatible con Web Crypto API de Workers)
- Todos los endpoints de API deben devolver JSON con estructura `{ok: boolean, data?, error?}`
- El esquema D1 debe estar preparado para nuevas tablas (futuras herramientas) sin migraciones destructivas

## Herramientas previstas (futuro)
El panel admin está diseñado para albergar más herramientas. Cada nueva herramienta seguirá el patrón:
- Nueva entrada en el sidebar
- Nueva ruta en `/admin/dashboard/[herramienta]`
- Nuevas tablas en D1 (migraciones aditivas)
- Nuevos endpoints en `/api/[herramienta]/`
