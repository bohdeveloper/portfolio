# Portfolio personal — bohdeveloper.com

🌐 **Disponible en:** [bohdeveloper.com](https://bohdeveloper.com)

Portfolio Full Stack en producción. Frontend estático en la CDN global de Cloudflare, API edge en Pages Functions y base de datos SQLite (D1) sin servidor.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15 · React 18 · TypeScript · Tailwind CSS |
| API | Cloudflare Pages Functions (Edge Workers, TypeScript) |
| Base de datos | Cloudflare D1 (SQLite distribuido) |
| Auth | JWT · `jose` · `bcryptjs` · httpOnly cookie |
| Editor WYSIWYG | TipTap (`@tiptap/react`) |
| IA | Claude API — Haiku 4.5 (via fetch nativo) |
| Deploy | Cloudflare Pages — git push → deploy automático |

---

## Arquitectura

```
Cloudflare Pages (CDN global)
├── Next.js estático (output: 'export')    → servido desde ~300 PoPs
└── Pages Functions (functions/api/)       → API serverless en el edge
    └── D1 Database                        → datos junto al código
```

Sin servidor central. Auth JWT protege todas las rutas `/admin/*` via `functions/admin/_middleware.ts`. Blog y proyectos usan query params (`?slug=xxx`) por compatibilidad con `output: 'export'`.

---

## Apps en producción

### Portfolio público
- Landing con proyectos, skills, experiencia, blog panel lateral y juegos
- Case studies en `/projects?slug=xxx` para cada proyecto
- NeuralCanvas animado, modo claro/oscuro, SEO técnico

### Blog técnico (`/blog`)
- Editor WYSIWYG TipTap — cover image con compresión Canvas, publicar/borrador
- Filtro por tags (`/blog?tag=xxx`), reacciones emoji, comentarios con moderación
- Rendering dual: HTML (TipTap) + Markdown legacy via marked.js

### Minijuegos (`/public/games/`)
- Snake · Tetris · 2048 · Wordle ES · Flappy Bird
- HTML standalone sin dependencias, canvas responsive, récord en localStorage
- Comunicación con panel lateral via postMessage

### Panel Admin (`/admin/dashboard/`)

| App | Ruta | Descripción |
|---|---|---|
| **Tracker** | `/tracker` | Rutinas y hábitos semanales, horario visual, estadísticas |
| **Blog** | `/blog` | Editor TipTap, posts, comentarios y moderación |
| **Moneta** | `/moneta` | Presupuesto mensual previsto vs real, dos perfiles, CSV |
| **Bioptima** | `/bioptima` | Biometría (peso, medidas, IMC, % MG, TMB, TDEE), calorías y balance |
| **TintAI** | `/tintai` | Generador de ebooks con Claude API + lector con paginación |
| **Proyectos** | `/proyectos` | Case studies con editor TipTap |
| **Juegos** | `/juegos` | Gestión de minijuegos publicados |
| **Usuarios** | `/usuarios` | Multi-usuario con roles (super_admin / user) |

---

## Estructura del proyecto

```
portfolio/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                     ← Landing
│   │   │   ├── blog/page.tsx                ← Blog público
│   │   │   ├── projects/page.tsx            ← Case studies
│   │   │   └── admin/dashboard/
│   │   │       ├── tracker/
│   │   │       ├── blog/
│   │   │       ├── moneta/
│   │   │       ├── bioptima/
│   │   │       ├── tintai/
│   │   │       ├── proyectos/
│   │   │       ├── juegos/
│   │   │       └── usuarios/
│   │   └── components/
│   │       ├── layout/                      ← Navbar, AdminNavbar, Footer
│   │       ├── sections/                    ← Secciones de la landing
│   │       └── ui/                          ← BlogPanel, SocialPanel
│   └── functions/api/
│       ├── auth/                            ← login · logout · me
│       ├── blog/                            ← posts · reactions · comments
│       ├── tracker/                         ← schedule · save · stats
│       ├── moneta/                          ← data · item · summary · copy
│       ├── bioptima/                        ← profile · biometrics · daily · stats
│       ├── tintai/                          ← generate · books · chapter · progress
│       ├── projects/                        ← list · post · save · delete
│       ├── games/                           ← list · manage · react
│       └── admin/                           ← users
├── schema.sql                               ← Tablas base (auth, tracker, blog, games, projects)
├── schema-moneta.sql
├── schema-bioptima.sql
├── schema-tintai.sql
├── ROADMAP.md
└── README.md
```

---

## Instalación local

```bash
cd frontend
npm install
npm run dev
```

Crea `frontend/.dev.vars` con:

```
JWT_SECRET=tu_secreto_local
ANTHROPIC_API_KEY=sk-ant-...   # necesario solo para TintAI
```

---

## Base de datos D1

Aplicar schemas en producción:

```bash
wrangler d1 execute bohdeveloper-admin --file=frontend/schema.sql --remote
wrangler d1 execute bohdeveloper-admin --file=schema-moneta.sql --remote
wrangler d1 execute bohdeveloper-admin --file=schema-bioptima.sql --remote
wrangler d1 execute bohdeveloper-admin --file=schema-tintai.sql --remote
```

---

## Scripts

```bash
npm run dev      # Desarrollo Next.js
npm run build    # Build estático para producción
```

---

## Deploy

```bash
git push origin main
```

Cloudflare Pages detecta el push y despliega automáticamente.
