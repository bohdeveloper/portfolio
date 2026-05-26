# Post 1 — Stack técnico

**Título:** Next.js + Cloudflare Pages + D1: por qué elegí este stack para mi portfolio (y para todo lo demás)
**Excerpt:** Podría haber elegido Vercel + PlanetScale. Elegí Cloudflare. Te cuento por qué este stack de tres piezas es el más eficiente que he usado, con código real y sin filtros.
**Tags:** Next.js, Cloudflare, D1, Full Stack

---

Podría haber montado el portfolio en Vercel. Es la opción obvia para Next.js.

No lo hice. Elegí Cloudflare Pages + D1 y ha sido la mejor decisión técnica del proyecto. Te explico por qué, con código real.

## El problema con "la opción obvia"

Vercel es perfecto para un frontend puro. El problema llega cuando necesitas **backend real**: base de datos, autenticación, APIs privadas. Ahí pagas dinero real y añades latencia con capas de servidor separadas.

Mi portfolio necesitaba un tracker de hábitos, un blog con panel admin y autenticación JWT. Todo eso, con **un solo proveedor, en el edge, con tier gratuito**.

## La arquitectura en tres piezas

```
Cloudflare Pages (CDN global)
├── Next.js estático (HTML/CSS/JS)     → servido desde ~300 PoPs globales
└── Pages Functions (Edge Workers)     → API en el mismo dominio
    └── D1 Database (SQLite)           → datos junto al código
```

No hay servidor central. Tu código y tus datos viven cerca del usuario.

## Pieza 1: Next.js como export estático

```ts
// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};
```

`next build` genera HTML, CSS y JS puros. Cloudflare lo sirve desde su CDN. **Latencia mínima, caché global, coste casi cero.**

Trade-off real: sin rutas dinámicas en build time. El blog usa `/blog?slug=xxx`. Googlebot ejecuta JS, los posts se indexan. Compromiso aceptable para la primera versión.

## Pieza 2: Pages Functions como backend

Un archivo en `functions/api/` = un endpoint. Sin Express, sin servidor Node.

```ts
// functions/api/blog/list.ts  →  GET /api/blog/list
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB
    .prepare('SELECT id, slug, title FROM blog_posts WHERE published = 1')
    .all();
  return new Response(JSON.stringify({ ok: true, data: results }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

El middleware de autenticación protege todas las rutas `/admin/*` con un solo archivo TypeScript.

## Pieza 3: D1 — SQLite sin complicaciones

```sql
CREATE TABLE IF NOT EXISTS blog_posts (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  slug      TEXT UNIQUE NOT NULL,
  title     TEXT NOT NULL,
  content   TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

Cero latencia entre código y datos porque viven en el mismo edge node.

## El resultado

| | Valor |
|---|---|
| Coste en producción | 0 €/mes |
| Despliegue | `git push` |
| Latencia API (Europa) | <50ms |
| Mantenimiento | Ninguno |

Si estás planificando tu próximo proyecto personal y quieres maximizar lo que construyes con tiempo y coste limitados: empieza por Cloudflare.
