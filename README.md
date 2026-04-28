
# Portfolio personal (Landing)

🌐 **Disponible en:** https://bohdeveloper.com

---

Portfolio personal desarrollado con un enfoque **frontend-first**, optimizado para rendimiento, SEO y escalabilidad, y preparado para evolucionar progresivamente hacia una arquitectura **Full Stack moderna**.

El objetivo es disponer de una base sólida, clara y mantenible, introduciendo backend **solo cuando aporte valor real** al producto y al contenido.

---

## 1. Tecnologías utilizadas

### Frontend (estado actual)
- Next.js 14
- React 18
- TypeScript
- TailwindCSS 4
- ESLint
- Cloudflare Pages

> El portfolio se despliega como sitio estático optimizado, priorizando rendimiento y SEO.

---

## 2. Arquitectura actual

Next.js (Frontend)<br>
↓<br>
Cloudflare Pages

- Sitio completamente funcional sin backend
- Contenido renderizado de forma estática
- Estructura preparada para consumir una API en el futuro
- Separación clara entre datos, lógica y UI

---

## 3. Preparado para backend (sin usarlo aún)

El frontend está diseñado para **no depender del origen de los datos**, permitiendo una migración limpia a backend sin reescribir la UI.

Concepto clave:

/data/projects.ts      → Fuente de datos actual<br>
/services/projects     → Capa de acceso a datos<br>
/types/project.ts      → Tipos compartidos<br>
/api/projects          → Fuente futura (backend)

La UI consume datos exclusivamente a través de la capa de servicios.  
Cambiar de datos estáticos a API no implica cambios en los componentes.

---

## 4. Estructura del proyecto (simplificada)

src/<br>
├── app/<br>
│   ├── page.tsx<br>
│   ├── projects/<br>
│   │   ├── page.tsx<br>
│   │   └── [slug]/page.tsx<br>
├── data/<br>
│   └── projects.ts<br>
├── services/<br>
│   └── projects.service.ts<br>
├── types/<br>
│   └── project.ts

---

## 5. Scripts disponibles

```bash
npm run dev     # Entorno de desarrollo
npm run build   # Compilación para producción
npm run start   # Ejecutar build
npm run lint    # Linter
```

## 6. Estado actual del proyecto

✅ Portfolio productivo en Cloudflare Pages
✅ SEO técnico optimizado
✅ Datos desacoplados de la UI
✅ Arquitectura preparada para backend
✅ Páginas de proyectos con enfoque escaparate

---

## 2. Instalación

Frontend
```bash
cd frontend
npm install
```

## 5. Scripts disponibles

Frontend
```bash
npm run dev       # Entorno de desarrollo
npm run build     # Compilar para producción
npm run start     # Ejecutar build
npm run lint      # Linter
```

## 6. Puesta en marcha

Frontend
```bash
cd portfolio-frontend
npm run dev
```
