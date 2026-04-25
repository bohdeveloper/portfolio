# Portfolio — Next.js + TailwindCSS + Express + Prisma + PostgreSQL

Este proyecto está compuesto por dos aplicaciones independientes que trabajan juntas:

- **Frontend:** Portfolio personal desarrollado con Next.js, TypeScript y TailwindCSS.  
- **Backend:** API REST construida con Express, Prisma y PostgreSQL para la gestión de datos.

El objetivo es disponer de un portfolio moderno, rápido y escalable, con un backend real para manejar proyectos y futuras funcionalidades.

---

## 1. Tecnologías principales

### Frontend
- Next.js 14  
- React 18  
- TypeScript  
- TailwindCSS 4  
- ESLint  

### Backend
- Node.js 20  
- Express  
- Prisma 5.15.0  
- PostgreSQL  
- TypeScript  

---

## 2. Estructura del proyecto

/portfolio-frontend
src/
app/
page.tsx
layout.tsx
components/
lib/
styles/
public/
package.json

/portfolio-backend
prisma/
schema.prisma
src/
server.ts
lib/
prisma.ts
routes/
projects.routes.ts
controllers/
projects.controller.ts
services/
projects.service.ts
package.json
tsconfig.json
.env

Código

---

## 3. Instalación

### Frontend
```bash
cd portfolio-frontend
npm install
Backend
bash
cd portfolio-backend
npm install
4. Configuración de la base de datos
En portfolio-backend/.env:

Código
DATABASE_URL="postgresql://usuario:password@localhost:5432/portfolio"
Ejecutar migraciones:

bash
npx prisma migrate dev
5. Scripts disponibles
Frontend
bash
npm run dev       # Entorno de desarrollo
npm run build     # Compilar para producción
npm run start     # Ejecutar build
npm run lint      # Linter
Backend
bash
npm run dev       # Ejecutar servidor Express con ts-node-dev
npm run build     # Compilar TypeScript
npm start         # Ejecutar versión compilada
npx prisma generate   # Generar cliente Prisma
npx prisma migrate dev # Migraciones
6. Puesta en marcha
Backend
bash
cd portfolio-backend
npm run dev
Disponible en:

Código
http://localhost:4000
Frontend
bash
cd portfolio-frontend
npm run dev
Disponible en:

Código
http://localhost:3000
7. Contacto
GitHub: (añadir enlace)

LinkedIn: (añadir enlace)

Email: (añadir email)

8. Licencia
Este proyecto es de uso personal.