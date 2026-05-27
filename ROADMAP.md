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

### Notas de arquitectura
# output: 'export' (estático) → rutas de blog usan ?slug=xxx (query param)
# Googlebot ejecuta JS → SEO aceptable para primera versión
# Tags en URL (/blog?tag=xxx) son crawleables e indexables por buscadores

---

:: FASE 5 — App Moneta (Control Presupuestal) (✅ COMPLETADA — MVP en producción)
· Objetivo: control mensual de presupuesto — PREVISTO vs REAL — con dos perfiles (Pareja / Personal).

### Implementación
# ✅ D1: tablas moneta_profiles, moneta_items, moneta_monthly_summary
# ✅ 2 perfiles sembrados: Pareja (id=1), Personal (id=2)
# ✅ Modelo plano: ítems libres por mes/perfil — sin subcategorías ni árbol fijo
# ✅ API /api/moneta/data    — GET (perfiles + ítems del mes + resumen mensual)
# ✅ API /api/moneta/item    — POST (crear), PATCH (editar nombre/importe/real), DELETE
# ✅ API /api/moneta/copy    — POST (copia ítems del mes anterior, solo amount)
# ✅ API /api/moneta/summary — POST (saldo_inicial, close/reopen mes)
# ✅ Admin /dashboard/moneta: columnas por perfil, secciones GASTOS e INGRESOS
# ✅ Añadir ítems: botón + → formulario inline (nombre + importe)
# ✅ Edición inline de nombre: click sobre nombre → input → Enter/Escape
# ✅ Edición inline de previsto y real: click → input → Enter/Escape
# ✅ Columnas PREVISTO / REAL en gastos; botón = copia previsto → real
# ✅ Total real: solo suma ítems con real_amount explícito (no mezcla con estimados)
# ✅ Ahorro real: ingresos previsto − total gastos reales (cuando hay algún real)
# ✅ Saldo inicial por perfil/mes: campo editable, guardado en moneta_monthly_summary
# ✅ Saldo final estimado: saldo_inicial + ahorro_real (se muestra cuando ambos disponibles)
# ✅ Copiar mes anterior: botón con confirmación previa (siempre, sin condiciones)
# ✅ Cerrar mes: confirmación con preview de ahorro + saldo final → guarda estado en D1
# ✅ Mes cerrado: card con fecha, ahorro real y saldo final + botón Reabrir mes
# ✅ Navegación mensual: adelante/atrás sin recarga
# ✅ Tabs de perfil: Pareja / Personal
# ✅ Dashboard card Moneta con icono SVG

### Pendiente (sin fase asignada)
# ✅ Exportación CSV mensual — botón ↓ CSV en topbar, descarga client-side con BOM UTF-8
# ✅ Vista histórico: evolución del ahorro mes a mes — gráfica SVG de barras por perfil
# ✅ Alertas visuales al superar el presupuesto — ⚠ en celda real + total gastos cuando real > previsto

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

:: FASE 10 — Sistema multiusuario + roles (⬜ PLANIFICADA)
· Objetivo: soporte para múltiples usuarios admin con roles y datos independientes.
  Borja mantiene el rol super_admin y puede dar de alta usuarios con permisos inferiores.

### Roles
# super_admin — acceso total + gestión de usuarios + todos los datos
# editor      — CRUD completo sobre sus propios datos (Moneta, Tracker)
# viewer      — solo lectura de sus propios datos, sin crear ni editar

### D1 — cambios de esquema
# ALTER TABLE admin_users ADD COLUMN role TEXT NOT NULL DEFAULT 'editor'
# ALTER TABLE admin_users ADD COLUMN active INTEGER NOT NULL DEFAULT 1
# Moneta: moneta_profiles ya actúa como separador — añadir user_id FK
# Tracker: ALTER TABLE tracker_records ADD COLUMN user_id INTEGER
#          ALTER TABLE tracker_notes   ADD COLUMN user_id INTEGER
# Migración no destructiva: UPDATE ... SET user_id = 1 para todos los datos existentes
# Blog: global compartido — sin user_id (super_admin + editors publican, viewers leen)

### Autenticación — cambios
# JWT payload: añadir { user_id, role } al sign en /api/auth/login
# /api/auth/me: devolver user_id y role
# Middleware: leer role del JWT, bloquear según ruta y role
#   · viewer no puede acceder a rutas POST/PATCH/DELETE
#   · solo super_admin puede acceder a /admin/dashboard/usuarios

### APIs — filtrado por user_id
# Todas las APIs de Tracker leen user_id del JWT y filtran registros
# Todas las APIs de Moneta filtran moneta_profiles por user_id del JWT
# APIs de Blog: sin cambio (global) — solo role check para escritura
# Cada usuario ve exclusivamente sus datos de Tracker y Moneta

### Panel de gestión de usuarios (solo super_admin)
# Nueva card en /admin/dashboard: Usuarios
# /admin/dashboard/usuarios: lista de usuarios con role y estado activo/inactivo
# Crear usuario: username, email, password, role (editor o viewer)
# Editar: cambiar role, activar/desactivar (no se puede crear otro super_admin)
# No se puede desactivar ni editar al propio super_admin desde el panel

### Notas de arquitectura
# Moneta: cada usuario tiene sus propios perfiles y sus propios meses — sin cruce de datos
# Tracker: registros y notas independientes por usuario — patrones distintos por persona
# Blog: un solo blog público — el contenido es del proyecto, no de cada usuario
# bcryptjs ya disponible en el stack — sin nueva dependencia para hash de contraseñas
# Migración segura: datos actuales (user_id = 1, Borja) no se tocan

---

:: FASE 11 — Visibilidad y retención de usuarios (⬜ FUTURO)
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
# moneta_* prefix en tablas D1 — evita conflictos con otras tablas del mismo namespace
# Modelo plano (ítems libres) en lugar de árbol fijo — más flexible para uso real mensual
# Total real solo suma real_amount explícitos — evita mezclar estimados con reales
# UPSERT (ON CONFLICT DO UPDATE) en moneta_monthly_summary — cubre insert y update en una sola query
# APIs separadas por entidad (item, copy, summary) — cada fichero = un endpoint limpio
# onRequestGet/Post/Delete en mismo fichero — Pages Functions soporta named exports por método

### Decisiones técnicas activas
# bcryptjs — compatible Workers, sin deps nativas
# jose — JWT, Web Crypto API compatible
# TipTap (@tiptap/react) — editor WYSIWYG, genera HTML que se renderiza directamente en /blog
# marked (CDN) — fallback legacy para posts escritos en Markdown antes del editor TipTap
# Chart.js (CDN) — gráficas tracker sin bundle adicional
# CSS variables --adm-* en admin/layout.tsx — theming consistente claro/oscuro
# NeuralCanvas — canvas animado, lee html.light/dark cada frame sin re-renders React
# output: 'export' — estático puro, migración a SSR planificada en Fase 9
