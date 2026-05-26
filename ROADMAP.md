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

:: FASE 4 — Blog técnico (🔄 EN PROGRESO)
· Objetivo: autoridad + tráfico orgánico. Artículos sobre Next.js, CF Workers, D1...

### Implementación
# ✅ D1: tabla blog_posts (slug, title, excerpt, content, tags, published, views, reading_time)
# ✅ API pública: GET /api/blog/list, GET /api/blog/post?slug=xxx
# ✅ API admin (auth): POST /api/blog/save, POST /api/blog/delete
# ✅ Admin /dashboard/blog: editor Markdown + lista + preview + publicar/borrador
# ✅ Público /blog: lista de posts + vista individual (?slug=xxx)
# ✅ AdminNavbar + Dashboard: Blog añadido al registry de apps

### Pendiente blog
# ⬜ Aplicar schema en D1 producción: wrangler d1 execute bohdeveloper-admin --file=schema.sql
# ⬜ Sitemap dinámico con posts (requiere SSR o build-time fetch)
# ⬜ OG meta tags por post (título, descripción, image)
# ⬜ Migrar a @cloudflare/next-on-pages para SSR real (mayor SEO)
# ⬜ Sección /blog en el navbar del portfolio público

### Notas de arquitectura
# output: 'export' (estático) → rutas de blog usan ?slug=xxx (query param)
# Googlebot ejecuta JS → SEO aceptable para primera versión
# Migración a SSR completo anotada como siguiente mejora de infraestructura

---

:: FASE 5 — App Economía Personal (⬜ PLANIFICADA)
· Objetivo: control total de ingresos, gastos y ahorro — personal y en pareja.

### Funcionalidades previstas
# Dashboard principal
#   · Balance total (personal + pareja)
#   · Resumen mensual: ingresos, gastos, diferencia, ahorro
#   · Comparativa mes anterior
#   · Gráfica de evolución anual
#
# Gestión de movimientos
#   · Añadir ingreso / gasto con: fecha, importe, categoría, descripción, quién (yo/pareja/ambos)
#   · Editar y eliminar
#   · Filtros: fecha, categoría, tipo, importe
#   · Búsqueda por descripción
#
# Categorías personalizables
#   · Vivienda, Alimentación, Transporte, Ocio, Salud, Ropa, Suscripciones,
#     Ahorro, Inversión, Ingresos laborales, Ingresos extra…
#   · Color e icono por categoría
#
# Presupuestos y metas
#   · Límite mensual por categoría
#   · Alerta visual al superar el 80% / 100%
#   · Meta de ahorro mensual / anual
#
# Estadísticas
#   · Gráfica de gastos por categoría (donut)
#   · Evolución mensual (barras / línea)
#   · Comparativa yo vs. pareja
#   · Tasa de ahorro mensual
#   · Histórico anual / trimestral
#
# Vista "En pareja"
#   · Gastos compartidos vs. individuales
#   · Balance entre ambos (quién debe a quién)
#   · División de gastos comunes
#
# Exportación
#   · CSV mensual para auditoría personal

### Arquitectura D1 prevista
# tabla: transactions  → id, date, amount, type(income/expense), category_id, description, owner(me/partner/shared), created_at
# tabla: categories    → id, name, color, icon, budget_limit, type
# tabla: monthly_goals → id, year, month, savings_goal, updated_at

### Integración admin
# Nueva entrada en ADMIN_APPS: 'Economia'
# Ruta: /admin/dashboard/economia
# APIs: /api/economia/transactions (CRUD), /api/economia/stats, /api/economia/categories (CRUD)

---

:: FASE 6 — Proyectos dinámicos + páginas individuales (⬜ PLANIFICADA)
· Objetivo: proyectos en D1, páginas SEO por proyecto.

# ⬜ Tabla projects en D1
# ⬜ Página individual /projects/[slug] con case study
# ⬜ Admin: gestor de proyectos
# ⬜ Editor en admin (similar al blog)

---

:: FASE 7 — Infraestructura SSR + SEO avanzado (⬜ PLANIFICADA)
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

:: FASE 8 — Features de producto (⬜ FUTURO)
# ⬜ Analytics propios (pageviews en D1, sin terceros)
# ⬜ Newsletter simple (email capture + envío)
# ⬜ Formulario de contacto con D1 + notificación email
# ⬜ Cache con Cloudflare KV para posts populares
# ⬜ Feature flags
# ⬜ API pública de proyectos
# ⬜ Tests de API (Vitest + Miniflare)

---

### Decisiones técnicas activas
# bcryptjs — compatible Workers, sin deps nativas
# jose — JWT, Web Crypto API compatible
# marked (CDN) — render Markdown cliente sin bundle adicional
# Chart.js (CDN) — gráficas tracker sin bundle adicional
# CSS variables --adm-* en admin/layout.tsx — theming consistente claro/oscuro
# NeuralCanvas — canvas animado, lee html.light/dark cada frame sin re-renders React
# output: 'export' — estático puro, migración a SSR planificada en Fase 7
