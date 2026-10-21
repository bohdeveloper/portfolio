-- Borrado de datos personales tras la retirada del panel (21 oct 2026).
--
-- Motivo: el panel de administración y sus apps se retiraron el mismo día y
-- ningún código lee ya estas tablas. Contienen datos personales (salud,
-- finanzas, hashes de contraseña, alias de jugadores y hashes de IP
-- reversibles), y conservarlos sin uso choca con la minimización del RGPD
-- (art. 5.1.c). Borja pidió borrarlos todos.
--
-- Qué hace:
--   - DROP de las tablas de las apps retiradas: usuarios y login, tracker,
--     moneta, bioptima, tintai, eco (app anterior) y los datos de jugadores.
--   - blog_banned_ips: DROP (solo contenía hashes de IP; sin uso).
--   - blog_comments: se conservan los comentarios aprobados (alias y texto
--     publicados voluntariamente), pero ip_hash se vacía (''); la columna es
--     NOT NULL, así que no admite NULL.
--   - Se conservan projects, blog_posts, blog_reactions, games y
--     game_reactions: contenido público sin datos personales.
--
-- IRREVERSIBLE: no se hizo copia, precisamente para no dejar los datos en
-- otro sitio. Los esquemas siguen en schema-*.sql por si se recupera una app.
--
-- Ejecutar:
--   wrangler d1 execute bohdeveloper-admin --remote --file=./migrations/borrado-datos-personales-oct-2026.sql

PRAGMA defer_foreign_keys = true;

DROP TABLE IF EXISTS tracker_records;
DROP TABLE IF EXISTS tracker_tasks;
DROP TABLE IF EXISTS tracker_notes;
DROP TABLE IF EXISTS tracker_categories;

DROP TABLE IF EXISTS moneta_actuals;
DROP TABLE IF EXISTS moneta_items;
DROP TABLE IF EXISTS moneta_monthly_summary;
DROP TABLE IF EXISTS moneta_categories;
DROP TABLE IF EXISTS moneta_profiles;

DROP TABLE IF EXISTS bioptima_biometrics;
DROP TABLE IF EXISTS bioptima_daily;
DROP TABLE IF EXISTS bioptima_profile;

DROP TABLE IF EXISTS tintai_progress;
DROP TABLE IF EXISTS tintai_chapters;
DROP TABLE IF EXISTS tintai_books;

DROP TABLE IF EXISTS eco_transactions;
DROP TABLE IF EXISTS eco_goals;
DROP TABLE IF EXISTS eco_categories;

DROP TABLE IF EXISTS game_scores;
DROP TABLE IF EXISTS game_votes;
DROP TABLE IF EXISTS game_visitors;

DROP TABLE IF EXISTS login_attempts;
DROP TABLE IF EXISTS admin_users;

DROP TABLE IF EXISTS blog_banned_ips;

UPDATE blog_comments SET ip_hash = '';
