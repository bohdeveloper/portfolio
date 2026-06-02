🗺️ ROADMAP — bohdeveloper.com

---

> **Estado: DESARROLLO FINALIZADO — 2 junio 2026**
> El portfolio está en producción con todas las fases completadas.
> A partir de aquí: mantenimiento, ajustes puntuales y uso cotidiano de las apps.

---
---

## ✅ COMPLETADAS

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

:: FASE 1 — Blog técnico (✅ COMPLETADA)
· Objetivo: autoridad + tráfico orgánico. Artículos sobre Next.js, CF Workers, D1...

### Implementación
# ✅ D1: tabla blog_posts — slug, title, excerpt, content, cover_image, tags, published, views, reading_time
# ✅ API pública: GET /api/blog/list, GET /api/blog/post?slug=xxx
# ✅ API admin (auth): POST /api/blog/save, POST /api/blog/delete
# ✅ Admin /dashboard/blog: editor WYSIWYG TipTap, lista, publicar/borrador
# ✅ TipTap: toolbar completa (B/I/U, H1-H3, listas, código, blockquote, links, hr)
# ✅ CSS ProseMirror sincronizado con vista pública — WYSIWYG real
# ✅ Rendering dual: HTML (TipTap) directo, Markdown legacy via marked.js CDN
# ✅ Cover image: upload desde dispositivo → Canvas compress/resize → base64 en D1
# ✅ Público /blog: lista de posts + vista individual (?slug=xxx)
# ✅ Filtro por tags, reacciones emoji, sistema de comentarios con moderación

---

:: FASE 2 — App Moneta (Control Presupuestal) (✅ COMPLETADA)
· Objetivo: control mensual de presupuesto — PREVISTO vs REAL — con dos perfiles (Pareja / Personal).

### Implementación
# ✅ D1: tablas moneta_profiles, moneta_items, moneta_monthly_summary
# ✅ Edición inline, copiar mes anterior, cerrar/reabrir mes
# ✅ Exportación CSV, gráfica SVG de evolución histórica
# ✅ Alertas visuales al superar el presupuesto

---

:: FASE 3 — Interacción social en Blog (✅ COMPLETADA)
· Objetivo: convertir el blog en una experiencia bidireccional.

# ✅ Reacciones por post (👍❤️🔥💡), comentarios con hilos, moderación admin
# ✅ Botón Compartir (Web Share API + fallback clipboard)
# ✅ Banear IPs desde admin

---

:: FASE 4 — Panel lateral: Blog + Minijuegos (✅ COMPLETADA)
· Objetivo: panel lateral con 2 pestañas — blog + showcase de minijuegos propios.

# ✅ Pestaña Juegos: cards con screenshot, badge ⭐ TOP, reacciones, link Jugar
# ✅ TOP game float: botón animado bottom-left
# ✅ Admin /dashboard/juegos: CRUD + set TOP

---

:: FASE 5 — Sistema multiusuario + roles (✅ COMPLETADA)
· Objetivo: soporte para múltiples usuarios admin con roles y datos independientes.

# ✅ Roles: super_admin (acceso total) + user (apps propias)
# ✅ JWT payload con user_id y role — filtrado de datos por usuario
# ✅ Admin /dashboard/usuarios: CRUD de usuarios + activar/desactivar

---

:: FASE 6 — Proyectos dinámicos + case study pages (✅ COMPLETADA)
· Objetivo: proyectos en D1, gestión desde admin, páginas de case study por proyecto.

# ✅ D1: tabla projects con content, tags, github_url, demo_url, architecture
# ✅ Página pública /projects — lista + case study individual (?slug=xxx)
# ✅ Botón "Case study →" en tarjeta homepage cuando hay contenido en BD
# ✅ Case studies publicados: Unyona y Diamadmin

---

:: FASE 7 — Minijuegos propios (✅ COMPLETADA)
· Objetivo: juegos HTML standalone alojados en /public/games/.

# ✅ Snake, Tetris, 2048, Wordle (ES), Flappy Bird
# ✅ Comunicación con panel lateral via postMessage
# ✅ Récord personal en localStorage, HUD canvas cyan/dorado
# ✅ Controles teclado + touch en todos los juegos

---

:: FASE 8 — Visibilidad y retención (⏸ APLAZADA)
· Aplazada indefinidamente. No prioritaria con el volumen actual.

# ⏸ Analytics propios (D1, sin terceros)
# ⏸ Newsletter con envío de nuevos posts
# ⏸ Cache Cloudflare KV para posts populares
# ⏸ Notificaciones push (Service Worker)

---

:: FASE 9 — Infraestructura SSR + SEO avanzado (🚫 DESCARTADA)
· Motivo: riesgo alto de romper el deploy en Cloudflare por bajo beneficio real.

---

:: FASE 10 — App Bioptima (✅ COMPLETADA)
· Seguimiento dietético-deportivo personal: biometría, calorías, evolución y balance energético.

# ✅ D1: bioptima_profile, bioptima_biometrics, bioptima_daily
# ✅ Cálculos automáticos: IMC, % MG (US Navy), Masa Muscular, TMB (Mifflin-St Jeor), TDEE
# ✅ 2 inputs + 2 botones independientes: calorías quemadas / ingeridas
# ✅ Balance diario/semanal/mensual con badge déficit/superávit
# ✅ Gráficas SVG: peso, % MG, balance calórico
# ✅ Integración con Tracker: nota automática al guardar balance del día

---

:: FASE 11 — App TintAI (✅ COMPLETADA)
· Ebooks didácticos generados con Claude API. Biblioteca personal y lector integrado.

# ✅ D1: tintai_books, tintai_chapters, tintai_progress
# ✅ Generación incremental: TOC → capítulos uno a uno → finalizar
# ✅ Claude Haiku 4.5 via fetch nativo — sin dependencias externas
# ✅ Campo de instrucciones con plantillas XML (técnico, novela, general)
# ✅ 16 categorías: programación, literatura, novela, ciencia, filosofía...
# ✅ Lector con paginación por páginas (~160 palabras), progreso guardado
# ✅ Renderizado Markdown con marked.js dinámico, tipografía libro (Georgia serif)
# ✅ Bloques de código: estilo Catppuccin (#1e1e2e), fuente monospace

---
---

## 🔧 STACK EN PRODUCCIÓN

# Next.js 15 — output:export (estático), Cloudflare Pages
# Cloudflare Pages Functions — API serverless (TypeScript)
# Cloudflare D1 — SQLite distribuido, base de datos única: bohdeveloper-admin
# JWT (jose) + bcryptjs — auth sin deps nativas, compatible Workers
# TipTap — editor WYSIWYG en blog y proyectos
# Claude API (Haiku 4.5) — generación de ebooks en TintAI
# marked.js (CDN) — renderizado Markdown en lector TintAI
# CSS variables --adm-* — theming claro/oscuro en admin
# SVG puro — gráficas en Bioptima y Moneta sin Chart.js
# HTML standalone — minijuegos sin dependencias externas

---
---

## 🛠 MANTENIMIENTO

A partir del 2 junio 2026 el portfolio entra en modo mantenimiento.
Cambios permitidos sin nueva fase: ajustes de UX, corrección de bugs,
contenido del blog y proyectos, uso cotidiano de Bioptima y TintAI.
