🗺️ ROADMAP — bohdeveloper.com

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

:: FASE 1 — Blog técnico (✅ COMPLETADA — MVP en producción)
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

:: FASE 2 — App Moneta (Control Presupuestal) (✅ COMPLETADA — MVP en producción)
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
# ✅ Exportación CSV mensual — botón ↓ CSV en topbar, descarga client-side con BOM UTF-8
# ✅ Vista histórico: evolución del ahorro mes a mes — gráfica SVG de barras por perfil
# ✅ Alertas visuales al superar el presupuesto — ⚠ en celda real + total gastos cuando real > previsto

### Notas de arquitectura
# moneta_* prefix en tablas D1 — evita conflictos con otras tablas del mismo namespace
# Modelo plano (ítems libres) en lugar de árbol fijo — más flexible para uso real mensual
# Total real solo suma real_amount explícitos — evita mezclar estimados con reales
# UPSERT (ON CONFLICT DO UPDATE) en moneta_monthly_summary — cubre insert y update en una sola query
# APIs separadas por entidad (item, copy, summary) — cada fichero = un endpoint limpio
# onRequestGet/Post/Delete en mismo fichero — Pages Functions soporta named exports por método

---

:: FASE 3 — Interacción social en Blog (✅ COMPLETADA)
· Objetivo: convertir el blog en una experiencia bidireccional — lectores pueden reaccionar y comentar.

### Implementación
# ✅ D1: blog_reactions (post_id, emoji, count UNIQUE), blog_comments (hilo 1 nivel), blog_banned_ips
# ✅ API pública: GET/POST /api/blog/reactions — toggle con localStorage por sesión
# ✅ API pública: GET /api/blog/comments?slug, POST /api/blog/comments (pending)
# ✅ API admin: GET ?admin=1&filter=, PATCH (aprobar), DELETE ?ban=1 (banear IP)
# ✅ Blog público: botón Compartir (Web Share API + fallback clipboard), ReactionsBar, CommentsSection
# ✅ Admin blog: vista Comentarios con filtros Pendientes/Aprobados/Todos + Aprobar/Eliminar/Banear IP
# ✅ Alias del comentarista persistido en localStorage
# ✅ Reacciones por post: emojis (👍❤️🔥💡) con contador en tiempo real
# ✅ Respuestas a comentarios: hilo de un nivel de profundidad

---

:: FASE 4 — Panel lateral: Blog + Minijuegos (✅ COMPLETADA)
· Objetivo: panel lateral con 2 pestañas — blog ya existente + showcase de minijuegos propios.
  El juego TOP se muestra también como elemento flotante en la landing para captar atención.

### Implementación
# ✅ D1: tabla games (id, name, slug, description, url, screenshot, is_top) + game_reactions
# ✅ API pública: GET /api/games/list (juegos + reacciones + top)
# ✅ API pública: POST /api/games/react (toggle emoji, misma lógica que blog)
# ✅ API admin: POST/DELETE/PATCH /api/games/manage (CRUD + set TOP, super_admin)
# ✅ BlogPanel: 2 pestañas Blog / Juegos con tab bar compartida
# ✅ Pestaña Juegos: cards con screenshot, badge ⭐ TOP, descripción, reacciones, link Jugar
# ✅ TOP game float: botón animado bottom-left con nombre del juego TOP
# ✅ Admin dashboard: nueva card Juegos
# ✅ Admin /dashboard/juegos: lista + editor (nombre, slug, desc, URL, screenshot, TOP)

### Notas de arquitectura
# Los propios juegos (código de cada juego) se desarrollan en fases posteriores independientes
# Este esqueleto permite publicar cualquier URL externa o iframe como "juego"
# URL pública del juego: via link directo en panel lateral (URL del juego campo libre)

---

:: FASE 5 — Sistema multiusuario + roles (✅ COMPLETADA)
· Objetivo: soporte para múltiples usuarios admin con roles y datos independientes.
  Borja mantiene el rol super_admin y puede dar de alta usuarios con permisos inferiores.

### Roles
# super_admin — acceso total + gestión de usuarios + Blog + todos los datos
# user        — acceso completo a sus apps propias (Tracker, Moneta)

### Implementación
# ✅ D1: ALTER TABLE admin_users ADD COLUMN role + active
# ✅ D1: Tracker y Moneta con user_id FK — migración no destructiva (user_id = 1 para datos existentes)
# ✅ JWT payload: { user_id, role } — todas las APIs leen user_id del JWT y filtran registros
# ✅ Middleware: bloqueo por role (viewer sin POST/PATCH/DELETE, solo super_admin en /usuarios)
# ✅ /admin/dashboard/usuarios: lista + crear + editar role + activar/desactivar
# ✅ Dashboard: visibilidad de apps filtrada por role

### Notas de arquitectura
# bcryptjs ya disponible en el stack — sin nueva dependencia para hash de contraseñas
# Migración segura: datos actuales (user_id = 1, Borja) no se tocan
# Blog global compartido — sin user_id; Tracker y Moneta son por usuario

---

:: FASE 6 — Proyectos dinámicos + case study pages (✅ COMPLETADA)
· Objetivo: proyectos en D1, gestión desde admin, páginas de case study por proyecto.
· Patrón: misma arquitectura que el blog — query params (?slug=xxx) para mantener output:export sin romper Cloudflare.

### Implementación
# ✅ D1: tabla projects — slug, title, excerpt, content, cover_image, tags, github_url, demo_url, architecture, published, featured, views
# ✅ API pública: GET /api/projects/list, GET /api/projects/post?slug=xxx
# ✅ API admin (super_admin): POST /api/projects/save, POST /api/projects/delete
# ✅ Página pública /projects — lista + case study individual (?slug=xxx)
# ✅ Admin /dashboard/proyectos — lista + editor TipTap + imagen portada + featured
# ✅ Proyectos.tsx — carga desde API con fallback al array estático si BD vacía
# ✅ Dashboard admin — nueva card Proyectos (solo super_admin)
# ✅ Botón "Case study →" en tarjeta homepage solo si el proyecto tiene contenido en BD

### Notas de arquitectura
# output: 'export' → /projects usa ?slug=xxx (igual que /blog), sin dynamic routes
# Fallback estático en Proyectos.tsx: la sección homepage nunca queda vacía durante la migración
# featured=1 → el proyecto aparece primero en la lista pública

---

:: FASE 7 — Minijuegos propios (🚧 EN PROGRESO)
· Objetivo: implementar juegos propios alojados en /public/games/ como HTML standalone.
  Cada juego es un fichero .html autocontenido — sin dependencias externas.
  Se comunica con el panel lateral via postMessage (boh_score_live, boh_score).
  El récord personal persiste en localStorage con clave boh_<slug>.

### Juegos implementados
# ✅ Snake       — /public/games/snake.html   · puntuación, impulso, obstáculos, récord
# ✅ Tetris      — /public/games/tetris.html  · piezas, ghost, combos, encaje, récord
# ✅ 2048        — /public/games/2048.html    · grid 4×4, merge, win 2048, récord
# ✅ Wordle      — /public/games/wordle.html  · 5 letras ES, 6 intentos, teclado canvas, récord
# ✅ Flappy Bird — /public/games/flappy.html  · física, tubos, dificultad progresiva, récord

### Patrón técnico común (todos los juegos)
# Canvas responsive: Math.min(window.innerWidth, window.innerHeight) - 4
# Overlay HTML encima del canvas: pantalla inicio + game over (misma CSS en todos)
# HUD en canvas: puntuación actual (cyan) + récord (dorado si nuevo récord)
# postMessage al padre: { type: 'boh_score_live', score } durante partida
# postMessage al padre: { type: 'boh_score', score, game: '<slug>' } al terminar
# localStorage: clave boh_<slug> → récord personal del visitante
# Controles: teclado + touch (swipe o tap según el juego)

### Mejoras post-lanzamiento
# ✅ Wordle: colores al instante al validar — eliminado flip de 720ms
# ✅ Wordle: comodín Pista + game over inmediato + overlay mejorado
# ✅ Wordle: fix teclado invisible en móvil (iOS Safari / iframe)
# ✅ Juegos: nuevo layout featured + carrusel horizontal en BlogPanel

---

:: FASE 8 — Visibilidad y retención de usuarios (⬜ PLANIFICADA)
· Objetivo: aumentar tiempo en web y retorno de usuarios.

# ⬜ Analytics propios: pageviews, tiempo de sesión estimado, posts más leídos (D1, sin terceros)
# ⬜ Newsletter: email capture + envío de nuevos posts
# ⬜ Cache Cloudflare KV para posts populares (reduce lecturas D1)
# ⬜ Notificaciones push (Service Worker) para nuevos posts o juegos
# ⬜ Tests de API (Vitest + Miniflare)

---

:: FASE 9 — Infraestructura SSR + SEO avanzado (🚫 DESCARTADA)
· Motivo: riesgo alto de romper el deploy en Cloudflare por bajo beneficio real.
  El portfolio no justifica la migración de output:export a Workers SSR en este momento.
  Googlebot indexa las query params correctamente; los previews en redes son el único
  punto débil real pero no prioritario con el volumen actual de contenido.

---
---

## 🔮 APPS FUTURAS

---

:: FASE 10 — App Bioptima (🚧 EN PROGRESO)
· Seguimiento dietético-deportivo personal: biometría, calorías, evolución y balance energético.
· Integrada con el Tracker de hábitos para registro y visualización temporal unificada.

### Stack y arquitectura
# D1: tablas bioptima_profile, bioptima_biometrics, bioptima_daily
# API Pages Functions: /api/bioptima/profile, /biometrics, /daily, /stats
# Admin: /admin/dashboard/bioptima — vista principal con subvistas
# Integración con tracker: los registros diarios se vinculan a la fecha del Tracker

### Datos de perfil (bioptima_profile)
# Datos fijos del usuario: sexo, edad, talla — base para cálculos TMB y MG
# Un solo perfil por user_id (UPSERT)

### Registro biométrico (bioptima_biometrics)
# Peso corporal (kg) — campo principal con fecha
# Medidas corporales: cintura, cadera, cuello, tórax, bíceps, muslo (cm)
# Cálculo automático al guardar:
#   · IMC = peso / talla² — categoría asociada (bajo, normal, sobrepeso, obesidad)
#   · % MG (fórmula US Navy): hombre = 86.01·log10(cintura-cuello) − 70.04·log10(talla) + 36.76
#                              mujer  = 163.2·log10(cintura+cadera-cuello) − 97.72·log10(talla) − 78.39
#   · MM (Masa Muscular estimada) = peso × (1 − %MG/100)
#   · TMB Mifflin-St Jeor: hombre = 10·peso + 6.25·talla − 5·edad + 5
#                           mujer  = 10·peso + 6.25·talla − 5·edad − 161
# Todos los cálculos se almacenan en la fila junto al registro

### Registro diario de calorías (bioptima_daily)
# Un registro por día (date UNIQUE) vinculado a user_id
# Dos inputs independientes con sus botones de guardar:
#   · [Input + Botón] Calorías quemadas en entrenamiento (kcal_exercise)
#   · [Input + Botón] Calorías ingeridas en el día (kcal_intake)
# UPSERT por fecha — cada botón actualiza solo su campo
# Balance calórico diario = kcal_intake − (TDEE + kcal_exercise)
#   · TDEE = TMB × factor_actividad (sedentario 1.2, ligero 1.375, moderado 1.55...)
#   · Déficit negativo → pérdida; positivo → ganancia
# Comunicación con Tracker: al guardar calorías del día se añade nota automática al Tracker
#   en el registro de esa fecha (tracker_notes: "Bioptima — Balance: −450 kcal")

### Cálculos y visualización (stats)
# Panel de indicadores actuales: IMC, % MG, MM, TMB, TDEE
# Balance diario: calorías ingeridas − (TDEE + ejercicio) con badge déficit/superávit
# Resumen semanal: suma de balances diarios + media de kcal_intake y kcal_exercise
# Resumen mensual: evolución del peso, MG y balance acumulado
# Gráficas SVG (sin Chart.js externo): evolución de peso, % MG y balance calórico
#   · Eje X: fechas de registros
#   · Overlay con hito del último registro biométrico

### Vista Admin /dashboard/bioptima
# Subvista "Perfil": formulario con datos fijos (sexo, edad, talla) + valores calculados actuales
# Subvista "Biometría": formulario de nuevo registro + histórico con valores calculados
# Subvista "Diario": inputs de calorías del día + historial de los últimos 30 días
# Subvista "Evolución": gráficas SVG de tendencias con filtro semanal/mensual/todo

---

:: FASE 11 — App TintAI (⬜ PLANIFICADA)
· Ebooks didácticos generados por IA con Claude. Biblioteca personal, lectura en app y progreso guardado.

### Stack y arquitectura
# D1: tablas tintai_books, tintai_chapters, tintai_progress
# API Pages Functions: /api/tintai/generate, /books, /chapter, /progress
# Admin: /admin/dashboard/tintai — generación, biblioteca y configuración
# Claude API (claude-sonnet-4-6): generación de contenido por capítulos con prompt caching
# Sin dependencias de PDF — el ebook se almacena como HTML/Markdown en D1 y se renderiza en app

### Datos de libro (tintai_books)
# Metadatos: título, categoría, descripción, cover_color, total_chapters, status, created_at
# status: 'generating' | 'ready' | 'error' — la generación es asíncrona por capítulos
# Categorías predefinidas: programación, filosofía, ciencia, idiomas, historia, psicología

### Capítulos (tintai_chapters)
# Cada libro se divide en N capítulos generados individualmente (max ~2000 tokens por capítulo)
# chapter_index (0-based), title, content (Markdown), word_count
# Generación incremental: se va guardando capítulo a capítulo para no perder progreso si falla

### Progreso de lectura (tintai_progress)
# Un registro por libro por user_id: current_chapter, last_read_at
# UPSERT por (user_id, book_id) — actualiza al cambiar de capítulo

### Generación con Claude API
# Prompt sistema fijo (cacheado): rol de escritor didáctico, estilo claro y estructurado
# Prompt usuario: tema + categoría + índice de capítulos (generado primero)
# Flujo en 2 pasos:
#   1. Generar índice (títulos de N capítulos) — guardado en tintai_books.toc (JSON)
#   2. Generar cada capítulo por separado — guardado en tintai_chapters según van llegando
# El admin puede configurar: N capítulos (3-12), nivel (básico/intermedio/avanzado), idioma

### Vista Admin /dashboard/tintai
# Subvista "Generar": formulario (tema, categoría, capítulos, nivel, idioma) + botón Generar
#   · Barra de progreso en tiempo real mientras se generan los capítulos
#   · Preview del primer capítulo al terminar
# Subvista "Biblioteca": grid de libros con cover_color, título, categoría, fecha y estado
#   · Botón Leer → abre lector / Eliminar con confirmación
# Subvista "Lector": navegación prev/next por capítulos, progreso guardado automáticamente
#   · Renderizado Markdown → HTML con marked.js (ya en el stack)
#   · Barra de progreso visual (capítulo N de M)
# Subvista "Config": prompts del sistema editables, modelo seleccionable, temperatura

---
---

## 🔧 DECISIONES TÉCNICAS ACTIVAS

# bcryptjs — compatible Workers, sin deps nativas
# jose — JWT, Web Crypto API compatible
# TipTap (@tiptap/react) — editor WYSIWYG, genera HTML que se renderiza directamente en /blog y /projects
# marked (CDN) — fallback legacy para posts escritos en Markdown antes del editor TipTap
# Chart.js (CDN) — gráficas tracker sin bundle adicional
# CSS variables --adm-* en admin/layout.tsx — theming consistente claro/oscuro
# NeuralCanvas — canvas animado, lee html.light/dark cada frame sin re-renders React
# output: 'export' — estático puro, migración a SSR planificada en Fase 9
# Query params (?slug=xxx) en blog y proyectos — workaround para output:export compatible con Cloudflare Pages
