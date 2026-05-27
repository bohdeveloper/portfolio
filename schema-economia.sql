-- ============================================================
-- Fase 5: App Economía Personal
-- Ejecutar: wrangler d1 execute bohdeveloper-admin --file=schema-economia.sql --remote
-- ============================================================

-- Tabla de categorías personalizables
CREATE TABLE IF NOT EXISTS eco_categories (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL,
  color        TEXT    NOT NULL DEFAULT '#6366f1',
  icon         TEXT    NOT NULL DEFAULT '💰',
  budget_limit REAL    DEFAULT NULL,            -- límite mensual opcional
  type         TEXT    NOT NULL DEFAULT 'expense', -- 'income' | 'expense' | 'both'
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Tabla de transacciones
CREATE TABLE IF NOT EXISTS eco_transactions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT    NOT NULL,                -- formato ISO: YYYY-MM-DD
  amount      REAL    NOT NULL,
  type        TEXT    NOT NULL,               -- 'income' | 'expense'
  category_id INTEGER REFERENCES eco_categories(id) ON DELETE SET NULL,
  description TEXT    NOT NULL DEFAULT '',
  owner       TEXT    NOT NULL DEFAULT 'me',  -- 'me' | 'partner' | 'shared'
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Tabla de metas mensuales de ahorro
CREATE TABLE IF NOT EXISTS eco_goals (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  year         INTEGER NOT NULL,
  month        INTEGER NOT NULL,
  savings_goal REAL    NOT NULL DEFAULT 0,
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(year, month)
);

-- ── Categorías por defecto ──────────────────────────────────
INSERT OR IGNORE INTO eco_categories (id, name, color, icon, type, sort_order) VALUES
  (1,  'Vivienda',           '#6366f1', '🏠', 'expense', 1),
  (2,  'Alimentación',       '#f59e0b', '🛒', 'expense', 2),
  (3,  'Transporte',         '#3b82f6', '🚗', 'expense', 3),
  (4,  'Ocio',               '#ec4899', '🎉', 'expense', 4),
  (5,  'Salud',              '#10b981', '🏥', 'expense', 5),
  (6,  'Ropa',               '#8b5cf6', '👕', 'expense', 6),
  (7,  'Suscripciones',      '#f97316', '📱', 'expense', 7),
  (8,  'Ahorro',             '#14b8a6', '💰', 'expense', 8),
  (9,  'Inversión',          '#22c55e', '📈', 'expense', 9),
  (10, 'Ingresos laborales', '#00a8bf', '💼', 'income',  10),
  (11, 'Ingresos extra',     '#84cc16', '⚡', 'income',  11),
  (12, 'Otros gastos',       '#94a3b8', '📦', 'expense', 12);
