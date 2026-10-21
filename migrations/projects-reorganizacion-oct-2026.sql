-- Reorganización de la sección de proyectos (21 oct 2026).
--
-- Motivo:
--   1. Diamadmin sale de la home a petición de Borja. Se despublica en vez de
--      borrarlo para no perder el contenido ni el case study.
--   2. Unyona se separa en dos fichas porque son dos estados distintos: la
--      landing está terminada (unyona.com) y la aplicación está en desarrollo.
--      La fila existente pasa a describir solo la landing, con su stack real
--      (frontend/package.json del repo unyona-landing); la app es una fila nueva
--      sin repositorio público todavía («Repositorio próximamente»,
--      invariante 4).
--   3. ayudas_gv: «ruta hacia desarrollador senior» → «hoja de ruta» (Borja ya
--      es senior; la ruta es de actualización hacia IA aplicada).
--
-- Mantener sincronizado con el FALLBACK de
-- frontend/src/components/sections/Proyectos.tsx.
--
-- Ejecutar:
--   wrangler d1 execute bohdeveloper-admin --remote --file=./migrations/projects-reorganizacion-oct-2026.sql

UPDATE projects
SET published = 0,
    updated_at = datetime('now')
WHERE slug = 'diamadmin';

UPDATE projects
SET title = 'Unyona — landing',
    excerpt = 'Landing oficial de Unyona, red social local para conocer gente con tus intereses y quedar en persona. Explica el producto, capta la lista de espera de la beta y fija la identidad de marca antes de construir la aplicación.',
    tags = 'Next.js,React,TypeScript,Tailwind CSS,Motion,Resend,Cloudflare Pages',
    architecture = 'Landing estática · Next.js en Cloudflare Pages',
    updated_at = datetime('now')
WHERE slug = 'unyona';

INSERT OR IGNORE INTO projects
  (slug, title, excerpt, content, tags, github_url, demo_url, architecture, published, featured)
VALUES (
  'unyona-app',
  'Unyona — aplicación',
  'La red social en sí: perfiles múltiples por cuenta, radar local por geolocalización e intereses y quedadas en persona como objetivo final, no el tiempo en pantalla. En desarrollo, tras validar el interés con la landing.',
  '',
  'React,TypeScript,Tailwind CSS,Vite,Node.js,Express,Prisma,PostgreSQL,JWT,Zod',
  '',
  '',
  'Monorepo · SPA React + API REST Node.js + PostgreSQL',
  1,
  1
);

UPDATE projects
SET excerpt = REPLACE(excerpt, 'Laboratorio de mi ruta hacia desarrollador senior.', 'Laboratorio de mi hoja de ruta.'),
    updated_at = datetime('now')
WHERE slug = 'ayudas-gv';
