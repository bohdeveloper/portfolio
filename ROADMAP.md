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

## 🔄 MEJORAS POST-LANZAMIENTO

---

:: Junio 2026 — Tracker, Moneta y Responsive

### Tracker
# ✅ Bug fix: ON CONFLICT en save.ts corregido — clave (date, activity_id) en vez de (user_id, date, activity_id)
# ✅ Nuevo endpoint POST /api/tracker/bulk — upsert masivo hasta 365 registros
# ✅ Checkbox "Repetir en semanas siguientes" en modal de tracking — propaga el registro 52 semanas
# ✅ Todas las tareas del grid son ahora clickables (track:false incluido, cursor:pointer)
# ✅ Panel de día (day-cfg): las tarjetas muestran el estado de tracking del día (✓/✗/○)
# ✅ Action modal en day-cfg: completar/perder, comentario, copy-forward y botón "✎ Editar"
# ✅ Bug fix: categorías dinámicas con cat_key coincidente con CAT_CLS ya respetan el color del usuario
# ✅ Tooltip al hover: fondo verde/rojo según estado completada/perdida de la tarea
# ✅ Bloques del grid: solo color de categoría, sin tinting de estado — badges ✓/✗ en esquina
# ✅ Textos de bloques: 11px (antes 10px), white-space:nowrap, text-overflow:ellipsis
# ✅ Contraste automático: luminancia percibida del color de categoría → texto oscuro o claro
# ✅ "Sin categoría" editable: nombre y color configurables desde la pestaña Configurar
# ✅ Borde sutil en bloques: 1px solid rgba(255,255,255,.1)

### Moneta
# ✅ Timestamp "Últ. mod." muestra fecha completa (día, mes, año + hora:minuto)
# ✅ Timestamp persiste en localStorage por perfil+mes — sobrevive recargas y cierres
# ✅ Modo suma +N eliminado; reemplazado por botón + junto al valor en Previsto y Real
# ✅ Botón + abre input de suma inline que acumula al valor existente sin borrar el previo
# ✅ Confirmación antes de borrar ítem (muestra el nombre del ítem en el diálogo)

### Responsive
# ✅ Juegos: tabla de récords adaptada a móvil (rank-header / rank-row)
# ✅ Proyectos: formulario de 2 columnas colapsado a 1 en móvil
# ✅ Blog: editor ProseMirror con min-height reducida en móvil
# ✅ Bioptima: form-grid pasa a 1 columna en pantallas < 380px
# ✅ TintAI: eliminado inline style que bloqueaba la media query de 2 → 1 columna
# ✅ Usuarios: botones de acción con padding táctil correcto
# ✅ AdminNavbar: padding horizontal reducido en móvil (px-3 sm:px-6)

---

:: Agosto 2026 — Reposicionamiento del portfolio (alineación con CV y LinkedIn)

· Objetivo: que en 15 segundos se responda qué hago, cuánta experiencia tengo,
  si estoy disponible y dónde. Público: consultoras del sector público gallego,
  producto/tecnológicas gallegas y remoto nacional.

### Hero y posicionamiento
# ✅ Retirado el badge «Potenciado por Claude AI» del punto de mayor jerarquía
# ✅ Subtítulo: Java · Spring Boot · Oracle + cinco años en AAPP autonómica
# ✅ Píldora de disponibilidad: Vigo / Pontevedra · Remoto (punto pulsante)
# ✅ Servicios reorientados a aplicaciones empresariales y APIs REST

### Experiencia
# ✅ Inetum: «Actualidad» → «Julio 2026»
# ✅ Marco EJIE: 5 años continuados, 3 departamentos, 2 consultoras
# ✅ Detalle real de Inetum (AB10B, Berdindu, tramitación telemática)
# ✅ Bilbomática con contenido propio; añadido SKOOTIK (prácticas 2020)
# ✅ Retiradas las viñetas de IA y de «continúo formándome» de dentro del puesto
# ✅ Campos cliente/ubicación por empleo; tabs indexadas por posición

### Acerca de mí y Formación
# ✅ Texto reescrito: EJIE, stack profesional, transición planificada, traslado
# ✅ Tecnologías separadas en «Experiencia profesional» y «Proyectos propios»
# ✅ Certificado IFCD0112 Nivel 3 destacado como titulación oficial
# ✅ Eliminado el bloque «Próximamente: FP Superior en DAW»
# ✅ Añadidas las dos FP de grado medio (Irungo La Salle)

### Proyectos
# ✅ REXIA, BAKO y ayudas_gv añadidos (fallback + migración D1)
# ✅ Orden editorial por ORDEN_SLUGS: REXIA, BAKO, ayudas_gv, Unyona, Diamadmin
#    (REXIA primero: es el único que demuestra el stack UDA/Java/Oracle)
# ✅ Badge real por proyecto: Online / En producción / En desarrollo
# ✅ Nota «Repositorio próximamente» cuando no hay repo ni case study
# ✅ Fallback de Unyona y Diamadmin sincronizado con el contenido real de D1

### IA
# ✅ Sección reducida: fuera cita destacada, imagen grande y pills de eslogan
# ✅ Conservado graphify con métricas + Claude Code; frase de criterio
# ✅ Movida por debajo de Proyectos y Formación

### CV
# ✅ Dos versiones en /cv/: backend-sector-publico y fullstack-producto
# ✅ Componente CVDownload: dropdown accesible (aria-expanded/haspopup,
#    flechas, Escape, clic fuera) y modal a pantalla completa en móvil
# ✅ Selector también en la barra fija (sm, alineado a la derecha) y en el
#    menú móvil, en lugar de un enlace único al CV de backend
# ✅ 301 de /borja-olazabal-programador-web-cv.pdf al nuevo CV de backend

### SEO
# ✅ Title, description y keywords hacia Java/Spring/AAPP/Galicia
# ✅ JSON-LD Person: address Vigo, homeLocation, seeks, alumniOf, knowsAbout
# ✅ Sitemap con /projects y los dos PDF; alt text con palabras clave reales
# ✅ Un solo h1 en la home (Proyectos pasa a h2)

---

:: Agosto 2026 — CV nuevos y alineación de datos con el CV

# ✅ Sustituidos los dos PDF por la versión de agosto, manteniendo los mismos
#    nombres de fichero: no cambian URLs, sitemap ni el 301 de la ruta antigua
# ✅ Email unificado a ohb.seven@gmail.com (contacto, panel lateral, SocialPanel
#    y JSON-LD) — antes ohb_1@outlook.com, que ya no es el de los CV
# ✅ Experiencia previa alineada con el CV: Likale dic 2018-may 2019,
#    W. Diamant nov 2016-nov 2018, MegatronHQ hasta mar 2021
# ✅ Añadidos Puertas Jokin y Muebles Amets, agrupados fuera de las pestañas
#    en un bloque «Experiencia previa · industria y carpintería»
# ✅ Inetum: añadido NewGipe / AD77 en entorno J2EE-UDA (2023-2024)

---

## 🛠 MANTENIMIENTO

A partir del 2 junio 2026 el portfolio entra en modo mantenimiento.
Cambios permitidos sin nueva fase: ajustes de UX, corrección de bugs,
contenido del blog y proyectos, uso cotidiano de Bioptima y TintAI.
