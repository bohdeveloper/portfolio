# Portfolio personal — bohdeveloper.com

🌐 **En producción:** [bohdeveloper.com](https://bohdeveloper.com)

Portfolio profesional de **Borja Olazabal**, desarrollador web con cinco años en
proyectos de Administración Pública autonómica. Frontend estático servido desde la
CDN global de Cloudflare, API en el edge con Pages Functions y base de datos
SQLite distribuida (D1). Sin servidor central.

Detrás de `/admin` corre además una suite de aplicaciones personales de uso
diario: tracker de rutinas, control presupuestal, seguimiento dietético-deportivo
y un generador de ebooks con la API de Claude.

**Estado:** en producción y en mantenimiento — todas las fases de desarrollo
cerradas desde junio de 2026.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 (`output: "export"`) · React 18 · TypeScript · Tailwind CSS |
| API | Cloudflare Pages Functions — serverless en el edge |
| Base de datos | Cloudflare D1 — SQLite distribuido |
| Auth | JWT (`jose`) · `bcryptjs` · cookie httpOnly |
| Editor | TipTap (WYSIWYG) |
| IA | Claude API — Haiku 4.5, vía fetch nativo |
| Deploy | Cloudflare Pages — `git push` → despliegue automático |

```
Cloudflare Pages (CDN global, ~300 PoPs)
├── Next.js estático (output: "export")   → HTML/JS desde el edge
└── Pages Functions (functions/api/)      → API serverless
    └── D1 Database                       → datos junto al código
```

---

## Qué incluye

### Portfolio público
Landing con experiencia, proyectos, formación y contacto · selector de CV con dos
versiones · case studies en `/projects?slug=xxx` · modo claro/oscuro · tarjetas con
efecto holográfico · SEO técnico con JSON-LD.

### Blog técnico — `/blog`
Editor WYSIWYG TipTap con portada comprimida en Canvas · filtro por tags ·
reacciones emoji · comentarios con moderación y baneo de IPs · aviso de contenido
generado con IA conforme al EU AI Act.

### Minijuegos — `/games`
Snake · Tetris · 2048 · Wordle (ES) · Flappy Bird. HTML standalone sin
dependencias, controles de teclado y táctiles, récord en localStorage y
comunicación con el panel lateral por `postMessage`.

### Panel de administración — `/admin/dashboard`

| App | Descripción |
|---|---|
| **Tracker** | Rutinas y hábitos semanales, horario visual, estadísticas |
| **Blog** | Editor TipTap, posts, comentarios y moderación |
| **Moneta** | Presupuesto mensual previsto contra real, dos perfiles, exportación CSV |
| **Bioptima** | Biometría, IMC, % de grasa, TMB, TDEE y balance calórico |
| **TintAI** | Generador de ebooks con Claude API y lector con paginación |
| **Proyectos** | Case studies con editor TipTap |
| **Juegos** | Gestión de los minijuegos publicados |
| **Usuarios** | Multiusuario con roles `super_admin` / `user` |

---

## Estructura

```
portfolio/
├── frontend/
│   ├── src/app/                 Páginas (App Router → estático)
│   ├── src/components/          layout/ · sections/ · ui/
│   ├── src/hooks/               useCardHolo · useFadeInOnScroll
│   ├── functions/
│   │   ├── _middleware.ts       Cabeceras de seguridad
│   │   ├── admin/_middleware.ts Protección de /admin/*
│   │   └── api/                 auth · blog · tracker · moneta ·
│   │                            bioptima · tintai · projects · games · admin
│   ├── public/cv/               Los dos PDF de currículum
│   ├── public/games/            Minijuegos HTML standalone
│   └── schema.sql               Tablas base
├── migrations/                  Cambios de datos versionados
├── schema-*.sql                 Esquemas por app
├── .claude/agents/              Agentes del proyecto
└── .mcp.json                    Grafo de código (codebase-memory-mcp)
```

---

## Puesta en marcha

```bash
cd frontend
npm install
npm run dev      # desarrollo
npm run build    # build estático → frontend/out/
```

Crear `frontend/.dev.vars`:

```
JWT_SECRET=tu_secreto_local
ANTHROPIC_API_KEY=sk-ant-...   # solo necesario para TintAI
```

### Base de datos

```bash
# Esquemas iniciales
wrangler d1 execute bohdeveloper-admin --remote --file=frontend/schema.sql
wrangler d1 execute bohdeveloper-admin --remote --file=schema-moneta.sql
wrangler d1 execute bohdeveloper-admin --remote --file=schema-bioptima.sql
wrangler d1 execute bohdeveloper-admin --remote --file=schema-tintai.sql

# Cambios posteriores — siempre versionados en migrations/
wrangler d1 execute bohdeveloper-admin --remote --file=./migrations/<fichero>.sql
```

### Grafo de código

```bash
pip install codebase-memory-mcp
codebase-memory-mcp cli index_repository '{"repo_path": "<ruta absoluta>"}'
```

---

## Documentación

| Documento | Contenido |
|---|---|
| [spec.md](spec.md) | Qué es el proyecto, arquitectura, invariantes y metodología |
| [plan.md](plan.md) | Trabajo pendiente por fases e histórico de lo completado |
| [GRAPH_REPORT.md](GRAPH_REPORT.md) | Grafo de código: hotspots, comunidades y rutas |
| [CLAUDE.md](CLAUDE.md) | Reglas de trabajo para sesiones de Claude Code |

---

Este repositorio sigue **Spec-Driven Development**: `spec.md` y `plan.md` son la
única fuente de verdad. Nada se implementa sin su punto en el plan, y toda
decisión de producto o arquitectura queda registrada en la spec.
