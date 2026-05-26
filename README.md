
# Portfolio personal — bohdeveloper.com

🌐 **Disponible en:** https://bohdeveloper.com

---

Portfolio personal Full Stack construido sobre **Next.js + Cloudflare Pages + D1**.  
Frontend estático servido desde la CDN global de Cloudflare, con API edge en Pages Functions y base de datos SQLite (D1) sin servidor.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS 4 |
| API | Cloudflare Pages Functions (Edge Workers) |
| Base de datos | Cloudflare D1 (SQLite) |
| Auth | JWT · `jose` · `httpOnly` cookie 7 días |
| Editor WYSIWYG | TipTap (`@tiptap/react`, StarterKit, Link, Underline, Placeholder) |
| Deploy | Cloudflare Pages (git push → deploy automático) |

---

## Arquitectura

```
Cloudflare Pages (CDN global)
├── Next.js estático (output: 'export')    → servido desde ~300 PoPs
└── Pages Functions (functions/api/)       → API en el mismo dominio
    └── D1 Database                        → datos junto al código
```

- Sin servidor central. Código y datos en el edge, cerca del usuario.
- Auth JWT protege todas las rutas `/admin/*` via `functions/admin/_middleware.ts`.
- Blog usa query params (`?slug=xxx`, `?tag=xxx`) por compatibilidad con `output: 'export'`.

---

## Módulos en producción

### Portfolio público (`/`)
- Landing con sección de proyectos, skills, experiencia y contacto
- NeuralCanvas animado (canvas API, lee `html.light/dark` sin re-renders)
- Modo claro/oscuro, SEO técnico optimizado

### Blog técnico (`/blog`)
- Lista de artículos con filtro por tags (URL semántica `/blog?tag=xxx`)
- Vista individual de post con HTML generado por TipTap
- Rendering legacy Markdown via `marked.js` (CDN) para posts anteriores

### Panel Admin (`/admin`)
- Login con JWT, sesión persistente 7 días
- **Tracker de hábitos** (`/admin/dashboard/tracker`): registro diario, estadísticas semanales, gráfica de calor
- **Gestor de blog** (`/admin/dashboard/blog`): editor WYSIWYG TipTap, cover image con compresión Canvas, publicar/borrador

---

## Estructura del proyecto

```
portfolio/
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx                    ← Landing
│   │   ├── blog/page.tsx               ← Blog público
│   │   └── admin/
│   │       ├── login/page.tsx
│   │       └── dashboard/
│   │           ├── page.tsx            ← Dashboard admin
│   │           ├── tracker/page.tsx
│   │           └── blog/page.tsx       ← Editor WYSIWYG
│   ├── src/components/
│   │   ├── layout/AdminNavbar.tsx
│   │   ├── sections/                   ← Secciones de la landing
│   │   └── ui/                         ← BlogPanel, SocialPanel…
│   └── functions/api/                  ← Pages Functions (Edge API)
│       ├── auth/
│       ├── blog/
│       └── tracker/
├── blog-drafts/                        ← Posts pendientes de publicar
├── ROADMAP.md
└── README.md
```

---

## Instalación local

```bash
cd frontend
npm install
```

Copia `.dev.vars.example` a `.dev.vars` y añade `JWT_SECRET`:

```
JWT_SECRET=tu_secreto_local
```

---

## Scripts

```bash
npm run dev      # Desarrollo (Next.js + Wrangler Pages local)
npm run build    # Build estático para producción
npm run lint     # ESLint
```

---

## Deploy

`git push origin main` → Cloudflare Pages detecta el push y despliega automáticamente.

---

## Estado actual

✅ Portfolio productivo en Cloudflare Pages  
✅ Blog técnico con editor WYSIWYG (TipTap) — WYSIWYG real  
✅ Panel admin con tracker de hábitos  
✅ Auth JWT con sesión persistente  
✅ Filtrado de posts por tags con URL semántica  
✅ SEO: sitemap estático, títulos dinámicos, tags en URL indexables  
