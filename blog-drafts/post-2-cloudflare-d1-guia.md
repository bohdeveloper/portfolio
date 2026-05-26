# Post 2 — Cloudflare D1

**Título:** Cloudflare D1: la base de datos que no sabía que necesitaba (guía práctica 2025)
**Excerpt:** SQLite en el edge, sin servidor, con el tier gratuito más generoso del mercado. D1 no es perfecta, pero para el 90% de los proyectos personales y SaaS pequeños es la mejor opción ahora mismo.
**Tags:** Cloudflare, D1, Base de datos, Backend

---

Cuando busqué base de datos para mi portfolio tenía PlanetScale, Turso, Supabase y Neon sobre la mesa. Elegí una que entonces era bastante nueva: **Cloudflare D1**.

Un año después, con un tracker de hábitos y un blog en producción, te cuento qué es, dónde brilla y dónde falla.

## Qué es D1 en una frase

SQLite estándar que vive junto a tus Cloudflare Workers. Si sabes SQL, ya sabes D1. Sin ORM obligatorio, sin conceptos nuevos, **cero latencia entre tu código y tus datos**.

## Setup en 5 minutos

```bash
wrangler d1 create mi-proyecto
# Añade el output a wrangler.toml y ya tienes DB disponible en env.DB
```

```bash
wrangler d1 execute mi-proyecto --file=schema.sql --remote  # producción
wrangler d1 execute mi-proyecto --file=schema.sql --local   # desarrollo offline
```

## El API que usarás el 90% del tiempo

```ts
// Leer varios
const { results } = await env.DB
  .prepare('SELECT * FROM posts WHERE published = 1')
  .all<Post>();

// Leer uno
const post = await env.DB
  .prepare('SELECT * FROM posts WHERE slug = ?')
  .bind(slug).first<Post>();

// Escribir
await env.DB
  .prepare('INSERT INTO posts (title, slug) VALUES (?, ?)')
  .bind(title, slug).run();
```

Los `?` con `.bind()` escapan automáticamente. Sin riesgo de SQL injection.

## Límites que debes conocer antes de comprometerte

| Límite | Tier gratuito |
|---|---|
| Tamaño de base de datos | 500 MB |
| Reads por día | 5.000.000 |
| Writes por día | 100.000 |
| Filas por consulta | 1.000 |

Para un portfolio o SaaS con cientos de usuarios: más que suficiente. Para escrituras masivas o analytics complejos: mira Turso.

## D1 vs. alternativas — mi opinión directa

| | D1 | Turso | PlanetScale | Neon |
|---|---|---|---|---|
| Motor | SQLite | SQLite | MySQL | PostgreSQL |
| Edge-native | ✅ | ✅ | ❌ | ❌ |
| Tier gratuito | ✅ Generoso | ✅ Generoso | ❌ Eliminado 2024 | ✅ Limitado |
| GUI de admin | ❌ Básica | ✅ | ✅ | ✅ |

**Si ya estás en Cloudflare: D1 sin dudarlo.** La integración es tan natural que añadir cualquier otra base de datos introduce complejidad innecesaria.

## Donde me ha fallado

- La consola web de Cloudflare para ver datos es muy básica — acabé construyendo mi propio panel admin
- Sin GUI tipo TablePlus (para consultas cómodas necesitas Wrangler en terminal)
- Límite de 1.000 filas por consulta requiere paginación manual para exports

Aun así, para proyectos Cloudflare-first: **es la opción más sencilla que existe ahora mismo**.
