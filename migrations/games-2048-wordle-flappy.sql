-- Migración: registrar los tres juegos nuevos en la tabla games
-- Ejecutar: npx wrangler d1 execute bohdeveloper-admin --file=migrations/games-2048-wordle-flappy.sql --remote

INSERT OR IGNORE INTO games (name, slug, description, url, screenshot, is_top)
VALUES
  (
    '2048',
    '2048',
    'Combina tiles del mismo valor para llegar al 2048. Cuantos más combines, mayor la puntuación.',
    '/games/2048.html',
    '',
    0
  ),
  (
    'Wordle',
    'wordle',
    'Adivina la palabra de 5 letras en 6 intentos. Verde: posición correcta. Amarillo: letra presente.',
    '/games/wordle.html',
    '',
    0
  ),
  (
    'Flappy Bird',
    'flappy',
    'Mantén al pájaro volando esquivando las tuberías. Cada aletazo cuenta.',
    '/games/flappy.html',
    '',
    0
  );
