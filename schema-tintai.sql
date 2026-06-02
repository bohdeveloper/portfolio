-- ============================================================
-- TintAI — Ebooks didácticos generados con Claude API
-- Tablas: tintai_books, tintai_chapters, tintai_progress
-- Ejecutar: wrangler d1 execute bohdeveloper-admin --file=schema-tintai.sql --remote
-- ============================================================

-- Metadatos del libro. El contenido se genera capítulo a capítulo.
-- toc almacena el índice como JSON array de títulos de capítulos.
-- status evoluciona: 'generating' → 'ready' (o 'error' si falla).
CREATE TABLE IF NOT EXISTS tintai_books (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL,
  title         TEXT    NOT NULL,
  category      TEXT    NOT NULL,
  description   TEXT,
  level         TEXT    NOT NULL DEFAULT 'intermedio',  -- 'básico'|'intermedio'|'avanzado'
  language      TEXT    NOT NULL DEFAULT 'español',
  num_chapters  INTEGER NOT NULL DEFAULT 6,
  cover_color   TEXT    NOT NULL DEFAULT '#00e7eb',
  toc           TEXT,              -- JSON: ["Capítulo 1: ...", "Capítulo 2: ..."]
  status        TEXT    NOT NULL DEFAULT 'generating',  -- 'generating'|'ready'|'error'
  error_msg     TEXT,
  word_count    INTEGER DEFAULT 0,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contenido de cada capítulo en Markdown.
-- Se inserta capítulo a capítulo durante la generación.
CREATE TABLE IF NOT EXISTS tintai_chapters (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id       INTEGER NOT NULL REFERENCES tintai_books(id) ON DELETE CASCADE,
  chapter_index INTEGER NOT NULL,  -- 0-based
  title         TEXT    NOT NULL,
  content       TEXT    NOT NULL,  -- Markdown
  word_count    INTEGER DEFAULT 0,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(book_id, chapter_index)
);

-- Progreso de lectura por usuario y libro.
-- current_chapter es el índice (0-based) del capítulo abierto.
CREATE TABLE IF NOT EXISTS tintai_progress (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL,
  book_id         INTEGER NOT NULL REFERENCES tintai_books(id) ON DELETE CASCADE,
  current_chapter INTEGER NOT NULL DEFAULT 0,
  last_read_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, book_id)
);
