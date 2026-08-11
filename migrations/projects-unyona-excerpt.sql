-- Unyona: alinea la descripción con el CV (agosto 2026)
--
-- La descripción anterior presentaba la plataforma como si ya estuviera
-- operativa («con autenticación de doble factor y gestión de perfiles
-- múltiples»), mientras que el CV la describe como producto en validación con
-- landing de captación. Quien cruzara ambos documentos veía una contradicción.
--
-- Se cambia solo el excerpt: architecture y tags describen el stack con el que
-- se está construyendo y siguen siendo válidos.
--
-- Ejecutar:
--   wrangler d1 execute bohdeveloper-admin --remote --file=./migrations/projects-unyona-excerpt.sql

UPDATE projects
SET excerpt = 'Producto propio en fase de validación: identidad de marca y landing de captación de leads antes de construir la aplicación. La plataforma se plantea como red social de conexión local por geolocalización e intereses, con perfiles múltiples por cuenta.',
    updated_at = datetime('now')
WHERE slug = 'unyona';
