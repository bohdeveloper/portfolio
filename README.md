# Portfolio personal — bohdeveloper.com

🌐 **En producción:** [bohdeveloper.com](https://bohdeveloper.com)

Portfolio profesional de **Borja Olazabal**, desarrollador web con cinco años en
proyectos de Administración Pública autonómica. Frontend estático servido desde la
CDN global de Cloudflare, API en el edge con Pages Functions y base de datos
SQLite distribuida (D1). Sin servidor central.

**Estado:** en producción y en mantenimiento — todas las fases de desarrollo
cerradas desde junio de 2026.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 (`output: "export"`) · React 18 · TypeScript · Tailwind CSS |
| API | Cloudflare Pages Functions — lecturas públicas en el edge |
| Base de datos | Cloudflare D1 — SQLite distribuido |
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
Landing con trayectoria (industria → desarrollo Java → IA aplicada), formación
con hoja de ruta interactiva, experiencia, proyectos por estado y stack, IA en
la práctica y contacto · selector de CV con dos versiones (programador y
técnico) · case studies en `/projects?slug=xxx` · modo claro/oscuro · tarjetas
con efecto holográfico · SEO técnico con JSON-LD.

### Blog técnico — `/blog` (archivado)
Filtro por tags · reacciones emoji · comentarios aprobados en solo lectura ·
aviso de contenido generado con IA conforme al EU AI Act.

### Retirado en octubre de 2026
El panel `/admin` (tracker, Moneta, Bioptima, TintAI, gestión de contenidos y
usuarios) y los minijuegos. El código sigue en el historial de git; los datos personales
se borraron de D1.

---

## Estructura

```
portfolio/
├── frontend/
│   ├── src/app/                 Páginas (App Router → estático)
│   ├── src/components/          layout/ · sections/ · ui/
│   ├── src/hooks/               useCardHolo · useFadeInOnScroll
│   ├── functions/
│   │   ├── _middleware.ts       Cabeceras de seguridad y CSP
│   │   └── api/                 blog · projects (lecturas públicas)
│   ├── public/cv/               Los dos PDF de currículum (programador y técnico)
│   └── schema.sql               Tablas base
├── migrations/                  Cambios de datos versionados
├── schema-*.sql                 Esquemas de las apps retiradas
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

### Base de datos

```bash
# Esquemas iniciales
wrangler d1 execute bohdeveloper-admin --remote --file=frontend/schema.sql

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
