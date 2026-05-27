-- ============================================================
-- Moneta — App de control de presupuesto mensual
-- Modelo: perfiles → categorías (con sub-categorías) → importes reales por mes
-- Ejecutar: wrangler d1 execute bohdeveloper-admin --file=schema-moneta.sql --remote
-- ============================================================

CREATE TABLE IF NOT EXISTS moneta_profiles (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Categorías de ingreso/gasto con importe planificado.
-- parent_id permite un nivel de sub-categorías (ej: Servicios → Repsol, Digi…)
CREATE TABLE IF NOT EXISTS moneta_categories (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id     INTEGER NOT NULL REFERENCES moneta_profiles(id)    ON DELETE CASCADE,
  name           TEXT    NOT NULL,
  planned_amount REAL    NOT NULL DEFAULT 0,
  type           TEXT    NOT NULL DEFAULT 'expense', -- 'income' | 'expense'
  parent_id      INTEGER          REFERENCES moneta_categories(id)  ON DELETE CASCADE,
  sort_order     INTEGER DEFAULT 0
);

-- Importes reales registrados al final de cada mes
CREATE TABLE IF NOT EXISTS moneta_actuals (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES moneta_categories(id) ON DELETE CASCADE,
  year        INTEGER NOT NULL,
  month       INTEGER NOT NULL,
  amount      REAL    NOT NULL DEFAULT 0,
  UNIQUE(category_id, year, month)
);

-- ── Perfiles por defecto ────────────────────────────────────
INSERT OR IGNORE INTO moneta_profiles (id, name, sort_order) VALUES
  (1, 'Pareja',   1),
  (2, 'Personal', 2);

-- ── Categorías Pareja ───────────────────────────────────────
INSERT OR IGNORE INTO moneta_categories (id, profile_id, name, planned_amount, type, parent_id, sort_order) VALUES
  -- GASTOS
  (1,  1, 'Alquiler',  790,  'expense', NULL, 1),
  (2,  1, 'Servicios', 210,  'expense', NULL, 2),
  (3,  1, 'Repsol',    150,  'expense', 2,    1),
  (4,  1, 'Digi',       28,  'expense', 2,    2),
  (5,  1, 'Aguas',      10,  'expense', 2,    3),
  (6,  1, 'Seguro',     10,  'expense', 2,    4),
  (7,  1, 'Compras',   300,  'expense', NULL, 3),
  -- INGRESOS
  (8,  1, 'Yaimy',     742,  'income',  NULL, 1),
  (9,  1, 'Borja',     742,  'income',  NULL, 2),
  (10, 1, 'Ayudas',    516,  'income',  NULL, 3);

-- ── Categorías Personal ─────────────────────────────────────
INSERT OR IGNORE INTO moneta_categories (id, profile_id, name, planned_amount, type, parent_id, sort_order) VALUES
  -- GASTOS
  (11, 2, 'Terapia',   300,    'expense', NULL, 1),
  (12, 2, 'Servicios', 200,    'expense', NULL, 2),
  (13, 2, 'Gym',        30,    'expense', 12,   1),
  (14, 2, 'Biziki',     22,    'expense', 12,   2),
  (15, 2, 'Prime',       5,    'expense', 12,   3),
  (16, 2, 'Audible',     7,    'expense', 12,   4),
  (17, 2, 'HBO',        11,    'expense', 12,   5),
  (18, 2, 'Hevy',     3.49,    'expense', 12,   6),
  (19, 2, 'Netflix',    22,    'expense', 12,   7),
  (20, 2, 'Spotify',    12,    'expense', 12,   8),
  (21, 2, 'Disney',     11,    'expense', 12,   9),
  (22, 2, 'Bidegi',     20,    'expense', 12,   10),
  (23, 2, 'Yoigo',      10,    'expense', 12,   11),
  (24, 2, 'Claude',     22,    'expense', 12,   12),
  (25, 2, 'Ocio',      100,    'expense', NULL, 3),
  (26, 2, 'Pareja',    742,    'expense', NULL, 4),
  -- INGRESOS
  (27, 2, 'Inetum',   1668,    'income',  NULL, 1);
