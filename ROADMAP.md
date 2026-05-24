🗺️ ROADMAP

:: FASE 0 — Panel Admin + Tracker (EN CURSO)
· Objetivo: primer backend real en producción. Acceso exclusivo del propietario.

### Arquitectura decidida
# Stack: Next.js (frontend) + Cloudflare Pages Functions (API) + D1 (SQLite)
# Monorepo: /frontend (Next.js) — no hay repo backend separado
# Auth: JWT en httpOnly cookie, un solo usuario admin
# Rutas protegidas: /admin/dashboard/* via middleware Pages Functions

### Implementación paso a paso (según CLAUDE.md)
# ✅ PASO 1 — Verificar estructura y wrangler.toml
# ✅ PASO 2 — Crear base de datos D1: bohdeveloper-admin
# ✅ PASO 3 — Schema SQL: admin_users, tracker_records, tracker_notes
# ✅ PASO 4 — Crear usuario admin (bcrypt hash, nunca plaintext)
# ✅ PASO 5 — Pages Functions: /api/auth/login, /logout, /me
# ✅ PASO 6 — Middleware: functions/admin/_middleware.ts
# ✅ PASO 7 — Páginas Next.js: /admin/login, /admin/dashboard, /admin/dashboard/tracker (componente React)
# ✅ PASO 8 — APIs tracker: /api/tracker/save, /week, /stats
# ✅ PASO 9 — tracker.html eliminado de public (lógica integrada en React, protegida por middleware)
# ✅ PASO 10 — Variables de entorno: JWT_SECRET en .dev.vars local (añadir en Cloudflare Dashboard)
# ✅ PASO 11 — Despliegue exitoso → https://bohdeveloper.com

### Decisiones tomadas
# tracker.html → componente React en app/admin/dashboard/tracker/page.tsx (seguro, protegido por middleware)
# bcryptjs (compatible Workers, sin deps nativas)
# jose (JWT, Web Crypto API compatible)
# Sidebar extensible desde el inicio: array {name, path, icon}
# NO tocar ningún archivo del portfolio público

---

:: FASE 1 — Preparar frontend (sin backend)
· Objetivo: dejar el portfolio limpio, escalable y listo para API.

### Eliminar backend actual
# ✅ Borrar carpeta /backend del repo
# ✅ Evitar ruido y falsa complejidad

### Refactor de datos hardcodeados
# Mover proyectos a /data
# Crear tipos en /types
# Acceso a datos vía /services
# La UI no depende de la fuente de datos

/data/projects.ts  → hoy
/services/projects → siempre
/api/projects      → mañana

### Arquitectura documentada
# Explicar stack actual (Next.js + Pages)
# Justificar por qué no hay backend aún
# Definir arquitectura futura (Pages + Workers + D1)
# Documentar decisiones técnicas


:: FASE 2 — Crear backend real (Cloudflare Workers + D1)
· Objetivo: introducir Full Stack solo cuando aporta valor.

### Nuevo repo backend
# portfolio-backend
# Cloudflare Workers
# D1 (SQLite)
# Zod + Fetch API
# Backend desacoplado del frontend

### Primer caso real: formulario de contacto
# Endpoint /contact
# Validación
# Guardar mensajes en D1
# Rate limit / anti-spam
# (Opcional) emails de notificación


:: FASE 3 — Backend orientado a SEO
· Objetivo: contenido dinámico + posicionamiento.

### Gestión dinámica de proyectos
# Proyectos en D1
# Endpoint /projects
# El frontend consume API

### Página individual por proyecto
# URL SEO (/projects/slug)
# Descripción larga
# Tecnologías
# Retos y decisiones técnicas
# Screenshots / mockups
# Enlaces


:: FASE 4 — Blog técnico (opcional pero potente)
· Objetivo: autoridad + tráfico orgánico.

### Blog con backend
# Posts en D1
# Tags, fechas, lecturas
# URLs SEO-friendly (/blog/post-slug)


:: FASE 5 — Retos backend que suman valor
· Objetivo: demostrar profundidad Full Stack.

### Features escalables:
# Analytics propios
# Dashboard privado
# Cache con KV
# API pública de proyectos
# Feature flags
# Newsletter simple
# Logs y auditoría
# Migraciones D1
# Tests de API


:: FASE 6 — SEO avanzado
· Objetivo: que el portfolio trabaje por ti.

### Optimización continua:
# Clusters de contenido
# Enlaces internos (proyectos ↔ blog)
# Schema.org
# Rich snippets
# Lighthouse continuo

## ############################################################ ##
🗺️ ROADMAP EXPLICADO

####  Preparar el terreno para backend (sin usarlo aún) ####  
Objetivo: que el frontend esté listo para consumir una API real.

## Borrado de backend actual
Borrar la carpeta backend

1️⃣ Refactor de datos hardcodeados (explicación profunda)
🎯 Objetivo real
Que el frontend no dependa de “de dónde vienen los datos”.
Hoy vienen de ficheros locales.
Mañana vendrán de una API.
El componente no debería notar la diferencia.

:: Estado ideal del frontend (antes del backend)
🔹 Separar datos, lógica y UI
No tener proyectos así:
const projects = [...]Mostrar más líneas
Dentro del componente ❌

:: Estructura recomendada
src/
├── data/
│   ├── projects.ts
│
├── services/
│   ├── projects.service.ts
│
├── types/
│   ├── project.ts
│
├── app/projects/
│   ├── page.tsx
│   └── [slug]/page.tsx


🔹 Tipos claros (shared mental model)
types/project.ts

id
slug
title
description
longDescription
techStack
images
featured
createdAt

👉 Este tipo será igual:

en frontend
en backend
en BBDD

Eso es arquitectura limpia.

🔹 Fuente de datos intercambiable
services/projects.service.ts
Hoy:

Importa datos desde data/projects.ts

Mañana:

Hace fetch('/api/projects')

El resto del código no cambia.
Ejemplo conceptual:
getProjects(): Promise<Project[]>getProjectBySlug(slug): Promise<Project>Mostrar más líneas
No importa cómo esté implementado por debajo.

🔹 Resultado
:: Frontend desacoplado
:: Migración suave a backend
:: Demuestras criterio arquitectónico
:: No introduces complejidad prematura
Esto es exactamente lo que se hace en producto real.

:: /data/projects.ts → /api/projects explicado bien
Lo que estás diciendo con ese ejemplo es:

“Hoy los datos viven en el frontend, pero la app ya está preparada para que mañana vivan en una API sin reescribir la UI”.

Eso es una frase muy potente para entrevistas y README.

2️⃣ Arquitectura documentada (qué y cómo)
Esto NO es documentación pesada.
Es explicar decisiones, no código.

:: Dónde documentarlo
Opciones correctas:

README.md en el repo principal
Sección /architecture en la web
O ambas (top tier)


:: Qué explicar (estructura clara)
1. Visión general

Qué es el portfolio
Qué problema resuelve
Qué tipo de desarrollador eres


2. Arquitectura actual
Next.js + Cloudflare PagesStatic-firstSEO-orientedMostrar más líneas
Explicar:

Por qué no hay backend aún
Por qué es una decisión consciente


3. Arquitectura futura (key point)
Frontend → Cloudflare PagesBackend  → Cloudflare WorkersBBDD     → D1``Mostrar más líneas
Explicar:

Por qué Workers y no Express
Por qué D1
Por qué repos separados


4. Evolución progresiva
Explicar que:

El portfolio empieza estático
Escala cuando hay valor
El backend no es “postureo”

👉 Esto suma MUCHO a nivel seniority.

:: Frase clave que deberías poder escribir

“El backend se introduce únicamente cuando aporta valor al producto, priorizando siempre simplicidad, rendimiento y SEO.”

Eso es mentalidad producto.

3️⃣ Repo nuevo para backend (confirmación y explicación)
Sí ::
Lo correcto es:
🆕 Nuevo repo
portfolio-backend

Contenido:

Cloudflare Workers
D1
API REST
BBDD schema
Tests
README técnico


🔗 Relación frontend ↔ backend

Frontend: no sabe cómo está hecho el backend
Solo consume endpoints

Esto te permite:

Cambiar backend sin romper frontend
Mostrar arquitectura profesional
Escalar features sin tocar el core


4️⃣ ROADMAP MODIFICADO Y MEJORADO
Te lo dejo pulido y definitivo, incorporando todo lo anterior 👇

🗺️ ROADMAP EVOLUCIÓN PORTFOLIO FULL STACK (versión final)

🔹 FASE 1 — Preparar el terreno (sin backend)
Objetivo: frontend desacoplado y listo para API real.
:: Borrado de backend actual

Eliminar carpeta /backend
Justificar la decisión en README
Evitar ruido y deuda innecesaria


:: Refactor de datos hardcodeados

Proyectos movidos a /data
Tipos claros en /types
Acceso a datos vía /services

Concepto clave:
/data/projects.ts  → hoy
/services/projects → siempre
/api/projects      → mañana

👉 La UI nunca accede directamente a los datos.

:: Arquitectura documentada
Añadir README o sección /architecture explicando:

Stack actual
Decisiones técnicas
Arquitectura futura
Motivo de introducir backend progresivamente


🔹 FASE 2 — Introducir Backend (Cloudflare Workers + D1)
:: Backend en repo independiente

portfolio-backend
Workers + D1
Zod
API REST

Arquitectura:
Frontend (Next.js / Pages)
↓
API (Cloudflare Workers)
↓
D1 (SQLite)


:: Primer caso real: formulario de contacto

POST /contact
Validación
Persistencia
Rate limit
Emails opcionales


🔹 FASE 3 — Backend que aporta SEO
:: Proyectos dinámicos

Proyectos en D1
/projects
Páginas SEO por proyecto


:: Página individual de proyecto

Contenido largo
Retos
Decisiones técnicas
Screenshots y mockups


🔹 FASE 4 — Blog técnico (opcional pero potente)

Posts en D1
Tags
Lecturas
URLs SEO-friendly


🔹 FASE 5 — Retos backend que suman

Analytics propios
Dashboard privado
Cache (KV)
Feature flags
Tests
Migrations
Logs
API pública


🔹 FASE 6 — SEO avanzado

Clusters de contenido
Enlaces internos
Schema.org
Lighthouse continuo
