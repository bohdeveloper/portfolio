-- ============================================================
-- Bioptima — Seguimiento dietético-deportivo personal
-- Tablas: bioptima_profile, bioptima_biometrics, bioptima_daily
-- Ejecutar: wrangler d1 execute bohdeveloper-admin --file=schema-bioptima.sql --remote
-- ============================================================

-- Datos fijos del usuario — base para calcular TMB, MG e IMC.
-- Un único registro por user_id; siempre se actualiza via UPSERT.
CREATE TABLE IF NOT EXISTS bioptima_profile (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL UNIQUE,
  sex             TEXT    NOT NULL DEFAULT 'male',    -- 'male' | 'female'
  age             INTEGER NOT NULL DEFAULT 30,
  height_cm       REAL    NOT NULL DEFAULT 170,
  activity_factor REAL    NOT NULL DEFAULT 1.375,    -- sedentario=1.2 ligero=1.375 moderado=1.55 activo=1.725 muy_activo=1.9
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Registros de peso y medidas corporales.
-- Los cálculos (IMC, % MG, Masa Muscular, TMB, TDEE) se calculan en la API
-- y se guardan en la fila para no recalcular en cada consulta.
CREATE TABLE IF NOT EXISTS bioptima_biometrics (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL,
  date            TEXT    NOT NULL,   -- YYYY-MM-DD
  weight_kg       REAL    NOT NULL,
  waist_cm        REAL,
  hip_cm          REAL,
  neck_cm         REAL,
  chest_cm        REAL,
  bicep_cm        REAL,
  thigh_cm        REAL,
  bmi             REAL,              -- IMC = weight_kg / (height_m)²
  body_fat_pct    REAL,              -- % MG fórmula US Navy
  lean_mass_kg    REAL,              -- Masa muscular estimada = weight_kg * (1 - body_fat_pct/100)
  bmr             REAL,              -- TMB Mifflin-St Jeor
  tdee            REAL,              -- TDEE = bmr * activity_factor
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Registro diario de calorías — un registro por día por usuario.
-- kcal_exercise y kcal_intake son independientes: cada botón hace UPSERT de su campo.
CREATE TABLE IF NOT EXISTS bioptima_daily (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL,
  date            TEXT    NOT NULL,   -- YYYY-MM-DD
  kcal_exercise   REAL,              -- kcal quemadas en entrenamiento del día
  kcal_intake     REAL,              -- kcal ingeridas en el día
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);
