🗺️ ROADMAP — bohdeveloper.com

---

:: FASE 0 — Panel Admin + Tracker (✅ COMPLETADA)
· Objetivo: primer backend real en producción. Acceso exclusivo del propietario.

### Stack decidido
# Next.js (frontend) + Cloudflare Pages Functions (API) + D1 (SQLite)
# Auth: JWT en httpOnly cookie, un solo usuario admin
# Rutas protegidas: /admin/dashboard/* via middleware Pages Functions

### Implementación
# ✅ D1: bohdeveloper-admin — tablas admin_users, tracker_records, tracker_notes
# ✅ Pages Functions: /api/auth/login, /logout, /me
# ✅ Middleware: functions/admin/_middleware.ts
# ✅ Páginas: /admin/login, /admin/dashboard, /admin/dashboard/tracker
# ✅ APIs tracker: /api/tracker/save, /week, /stats
# ✅ Variables de entorno: JWT_SECRET (Cloudflare Dashboard + .dev.vars local)
# ✅ Login: split layout red neuronal, fix doble clic (window.location.href)
# ✅ AdminNavbar: sin enlaces en login, dinámico según ruta
# ✅ Enlace discreto a /admin: candado en SocialPanel (opacidad 18%)
# ✅ Tracker V2 (desde 5 junio 2026): Kronoshin, horario 7-14h, tarde rediseñada
# ✅ Tracker UX: leyenda dinámica, tooltip con motivo, colores modo oscuro mejorados

---

:: FASE 4 — Blog técnico (✅ COMPLETADA — MVP en producción)
· Objetivo: autoridad + tráfico orgánico. Artículos sobre Next.js, CF Workers, D1...

### Implementación
# ✅ D1: tabla blog_posts — slug, title, excerpt, content, cover_image, tags, published, views, reading_time
# ✅ D1 schema aplicado en producción via Cloudflare MCP
# ✅ API pública: GET /api/blog/list, GET /api/blog/post?slug=xxx
# ✅ API admin (auth): POST /api/blog/save, POST /api/blog/delete
# ✅ Admin /dashboard/blog: editor WYSIWYG TipTap, lista, publicar/borrador
# ✅ TipTap: toolbar completa (B/I/U, H1-H3, listas, código, blockquote, links, hr)
# ✅ CSS ProseMirror sincronizado con vista pública — WYSIWYG real (16px, line-height 1.8)
# ✅ Rendering dual: HTML (TipTap) directo, Markdown legacy via marked.js CDN
# ✅ Cover image: upload desde dispositivo → Canvas compress/resize → base64 en D1
# ✅ Público /blog: lista de posts + vista individual (?slug=xxx)
# ✅ Filtro por tags: /blog?tag=xxx — URL semántica, title dinámico para SEO
# ✅ Tags clicables: en lista y en post individual, filtran sin recargar
# ✅ Prose modo claro: corregido (sin prose-invert en light, texto legible)
# ✅ Blog panel lateral: auto-abre en desktop, overlay fullscreen en mobile
# ✅ Sesión admin persistente: JWT 7d, login verifica sesión existente al montar
# ✅ AdminNavbar: sin links de apps, enlace ← Portfolio en dashboard

### Posts pendientes de publicar (blog-drafts/)
# ⬜ post-1-nextjs-cloudflare-d1.md — "Next.js + Cloudflare Pages + D1: por qué elegí este stack"
# ⬜ post-2-cloudflare-d1-guia.md   — "Cloudflare D1: la base de datos que no sabía que necesitaba"
# ⬜ post-3-claude-ai-workflow.md   — "Un año usando Claude AI para programar"

### Pendiente blog (Fase 7)
# ⬜ Sitemap dinámico con posts (requiere SSR)
# ⬜ OG meta tags por post (open graph, twitter card)
# ⬜ Schema.org Article por post
# ⬜ Migrar a @cloudflare/next-on-pages para SSR real

### Notas de arquitectura
# output: 'export' (estático) → rutas de blog usan ?slug=xxx (query param)
# Googlebot ejecuta JS → SEO aceptable para primera versión
# Tags en URL (/blog?tag=xxx) son crawleables e indexables por buscadores

---

:: FASE 5 — App Economía Personal (✅ COMPLETADA — MVP en producción)
· Objetivo: control total de ingresos, gastos y ahorro personal.

### Implementación
# ✅ D1: tablas eco_transactions, eco_categories, eco_goals
# ✅ 12 categorías por defecto sembradas en D1 (Vivienda, Alimentación, Transporte…)
# ✅ API /api/economia/transactions — GET (lista por mes), POST (crear/editar), DELETE
# ✅ API /api/economia/categories  — GET (todas), POST (crear/editar), DELETE (desvincula txs)
# ✅ API /api/economia/stats       — GET (totales, desglose categoría, tendencia 6 meses), POST (meta ahorro)
# ✅ Admin /dashboard/economia: 3 vistas — Resumen, Transacciones, Categorías
# ✅ Dashboard: cards ingresos/gastos/balance, meta ahorro con barra de progreso, últimas txs
# ✅ Gráfica donut Chart.js (CDN) de gastos por categoría con leyenda
# ✅ Transacciones: filtros por tipo/categoría/quién, formulario inline crear/editar, total filtrado
# ✅ Categorías: grid con color/icono, presupuesto mensual por categoría, CRUD
# ✅ Navegación por meses: adelante/atrás sin recarga
# ✅ Quién: campo 'Yo / Pareja / Ambos' en cada transacción
# ✅ Dashboard card Economía añadida con icono SVG propio
# ✅ Schema SQL guardado en schema-economia.sql para referencias futuras

### Pendiente (mejoras futuras)
# ⬜ Vista "En pareja": balance compartido, quién debe a quién
# ⬜ Exportación CSV mensual
# ⬜ Gráfica de evolución mensual (barras) en vista Estadísticas
# ⬜ Alertas visuales al superar el presupuesto mensual por categoría

---

:: (ANTIGUA FASE 6 — renumerada como Fase 8)
:: (ANTIGUA FASE 7 — renumerada como Fase 9)

---

:: FASE 6 — Interacción social en Blog (⬜ PLANIFICADA)
· Objetivo: convertir el blog en una experiencia bidireccional — lectores pueden reaccionar y comentar.

### Funcionalidades
# Reacciones por post: emojis (👍❤️🔥💡) con contador en tiempo real
# Comentarios públicos: nombre/alias + texto, sin registro
# Respuestas a comentarios: hilo de un nivel de profundidad
# Compartir post: botones nativos Web Share API + fallback copiar enlace
# Admin: moderar/borrar comentarios desde /dashboard/blog
#   · Vista de comentarios por post, banear por IP (hash)

### Arquitectura D1
# tabla: blog_reactions   → post_id, emoji, count (UNIQUE post_id+emoji)
# tabla: blog_comments    → id, post_id, parent_id, alias, body, ip_hash, created_at, approved
# APIs públicas: GET /api/blog/reactions, POST /api/blog/react
#              GET /api/blog/comments?slug=xxx, POST /api/blog/comment
# API admin:   POST /api/blog/comment/delete (auth)

---

:: FASE 7 — Panel lateral: Blog + Minijuegos (⬜ PLANIFICADA)
· Objetivo: panel lateral con 2 pestañas — el blog ya existente + showcase de minijuegos propios.
  El juego TOP se muestra también como elemento flotante en la landing para captar atención.

### Panel lateral rediseñado
# 2 pestañas: "Blog" (comportamiento actual) y "Juegos" (nuevo)
# En móvil: botón flotante que abre un overlay con las 2 pestañas (actualmente solo el blog)
# Pestaña Juegos: lista de minijuegos con nombre, descripción, screenshot, badge TOP
# El juego marcado como TOP aparece resaltado en la lista

### Juego TOP en la landing
# Botón/card flotante animado que aparece en la landing (pulso, movimiento suave)
# Al hacer click abre el panel lateral directo en la pestaña Juegos con el TOP destacado
# Posición: esquina inferior-izquierda, sobre el nivel del footer

### Admin — gestor de minijuegos
# Nueva card en dashboard: Juegos
# /admin/dashboard/juegos: lista de juegos, campo URL/embed, descripción, screenshot
# Botón "Marcar como TOP" — solo 1 activo a la vez (el anterior pierde el badge)
# D1: tabla games → id, name, description, url, screenshot, is_top, created_at

### Interacción en juegos (misma infraestructura que blog — Fase 6)
# Reacciones, comentarios y respuestas vinculados a game_id
# Compartir: URL directa al juego en el portfolio

### Notas de arquitectura
# Los propios juegos (código de cada juego) se desarrollan en fases posteriores independientes
# Este esqueleto permite publicar cualquier URL externa o iframe como "juego"
# URL pública del juego: /juegos/[slug] o panel lateral en landing

---

:: FASE 8 — Proyectos dinámicos + páginas individuales (⬜ PLANIFICADA)
· Objetivo: proyectos en D1, páginas SEO por proyecto.

# ⬜ Tabla projects en D1
# ⬜ Página individual /projects/[slug] con case study
# ⬜ Admin: gestor de proyectos
# ⬜ Editor en admin (similar al blog)

---

:: FASE 9 — Infraestructura SSR + SEO avanzado (⬜ PLANIFICADA)
· Objetivo: máximo SEO y rendimiento.

# ⬜ Migrar a @cloudflare/next-on-pages (SSR vía Workers)
# ⬜ Eliminar output: 'export' de next.config.js
# ⬜ Blog posts con HTML pre-renderizado (meta tags reales por post)
# ⬜ Sitemap dinámico: posts + proyectos
# ⬜ OG images dinámicas por ruta
# ⬜ Schema.org (Person, Article, Project)
# ⬜ Links internos blog ↔ proyectos
# ⬜ Lighthouse continuo

---

:: FASE 10 — Visibilidad y retención de usuarios (⬜ FUTURO)
· Ideas para aumentar tiempo en web y retorno de usuarios.

# ⬜ Juego TOP flotante en landing (implementado en Fase 7)
# ⬜ Analytics propios: pageviews, tiempo de sesión estimado, posts más leídos (D1, sin terceros)
# ⬜ Newsletter: email capture + envío de nuevos posts con Cloudflare Email Workers
# ⬜ Formulario de contacto con notificación vía D1 + email
# ⬜ Cache Cloudflare KV para posts populares (reduce lecturas D1)
# ⬜ Notificaciones push (Service Worker) para nuevos posts o juegos
# ⬜ Tests de API (Vitest + Miniflare)

---

### Decisiones técnicas fase 5
# Chart.js (CDN) — gráfica donut en /economia, se carga bajo demanda si no está en window
# eco_* prefix en tablas D1 — evita conflictos con otras tablas del mismo namespace
# onRequestGet/Post/Delete en mismo fichero — Pages Functions soporta named exports por método

### Decisiones técnicas activas
# bcryptjs — compatible Workers, sin deps nativas
# jose — JWT, Web Crypto API compatible
# TipTap (@tiptap/react) — editor WYSIWYG, genera HTML que se renderiza directamente en /blog
# marked (CDN) — fallback legacy para posts escritos en Markdown antes del editor TipTap
# Chart.js (CDN) — gráficas tracker sin bundle adicional
# CSS variables --adm-* en admin/layout.tsx — theming consistente claro/oscuro
# NeuralCanvas — canvas animado, lee html.light/dark cada frame sin re-renders React
# output: 'export' — estático puro, migración a SSR planificada en Fase 7
