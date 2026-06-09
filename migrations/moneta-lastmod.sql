-- Migración: añade columna last_modified a moneta_monthly_summary
-- Aplicar en Cloudflare D1:
--   wrangler d1 execute bohdeveloper-admin --file=migrations/moneta-lastmod.sql --remote

ALTER TABLE moneta_monthly_summary ADD COLUMN last_modified DATETIME;
