-- Migración: tablas de horario dinámico del tracker
-- Aplicar en Cloudflare D1: wrangler d1 execute bohdeveloper-admin --file=migrations/tracker-schedule.sql

CREATE TABLE IF NOT EXISTS tracker_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  cat_key TEXT NOT NULL,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#666',
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, cat_key)
);

CREATE TABLE IF NOT EXISTS tracker_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  day_index INTEGER NOT NULL,
  activity_id TEXT NOT NULL,
  name TEXT NOT NULL,
  cat_key TEXT NOT NULL,
  start_min INTEGER NOT NULL,
  end_min INTEGER NOT NULL,
  description TEXT DEFAULT '',
  track INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, day_index, activity_id)
);

-- Seed categorías de Borja (user_id=1)
INSERT OR IGNORE INTO tracker_categories (user_id, cat_key, label, color, sort_order) VALUES
  (1, 'kronoshin', 'Kronoshin',        '#1a82b8', 0),
  (1, 'mente',     'Meditación/Mente', '#5048c8', 1),
  (1, 'flex',      'Flexibilidad',     '#0e8a68', 2),
  (1, 'prep',      'Prepararse',       '#555555', 3),
  (1, 'trabajo',   'Trabajo Inetum',   '#1a5080', 4),
  (1, 'cardio',    'BIZIKI/Cardio',    '#b03c14', 5),
  (1, 'shaolin',   'Shaolin/Entreno',  '#1e824e', 6),
  (1, 'psicologo', 'Psicólogo',        '#7a32a0', 7),
  (1, 'dormir',    'Dormir',           '#0a0e18', 8),
  (1, 'libre',     'Tiempo libre',     '#333333', 9);

-- Seed tareas Borja SCHED_V2 — Lunes (day_index=0)
INSERT OR IGNORE INTO tracker_tasks (user_id, day_index, activity_id, name, cat_key, start_min, end_min, description, track) VALUES
  (1, 0, 'lev',  'Levantada',              'prep',      300, 320,  '5:00 — Levantada. No negociable.',                                    0),
  (1, 0, 'kron', 'Kronoshin',              'kronoshin', 320, 360,  '5:20–6:00 · Meditación estoica + flexibilidad shaolin unificadas.',   1),
  (1, 0, 'pre',  'Prepararse',             'prep',      360, 390,  '6:00–6:30 · Ducha fría, desayuno, salida.',                          0),
  (1, 0, 'bus',  'Bus → Donostia',         'libre',     390, 420,  '6:30–7:00 · Bus Errentería → Donostia.',                             0),
  (1, 0, 'trab', 'Trabajo – Inetum',       'trabajo',   420, 840,  '7:00–14:00 · Jornada laboral Inetum.',                               0),
  (1, 0, 'vuel', 'Bus → Errentería',       'libre',     840, 900,  '14:00–15:00 · Trayecto de vuelta.',                                  0),
  (1, 0, 'ocio', 'Comer + Ocio / Descanso','libre',     900, 1170, '15:00–19:30 · Comer, descanso y tiempo personal.',                   0),
  (1, 0, 'biz',  'Biziki',                 'cardio',    1170,1245, '19:30–20:45 · Grupo running BIZIKI.',                                1),
  (1, 0, 'duch', 'Ducha + Cenar ligero',   'prep',      1245,1320, '20:45–22:00 · Ducha, cena ligera, relax.',                           0);

-- Seed tareas Borja SCHED_V2 — Martes (day_index=1)
INSERT OR IGNORE INTO tracker_tasks (user_id, day_index, activity_id, name, cat_key, start_min, end_min, description, track) VALUES
  (1, 1, 'lev',  'Levantada',                     'prep',      300, 320,  '5:00 — Levantada. No negociable.',                                    0),
  (1, 1, 'kron', 'Kronoshin',                     'kronoshin', 320, 360,  '5:20–6:00 · Meditación estoica + flexibilidad shaolin unificadas.',   1),
  (1, 1, 'pre',  'Prepararse',                    'prep',      360, 390,  '6:00–6:30 · Ducha fría, desayuno, salida.',                          0),
  (1, 1, 'bus',  'Bus → Donostia',                'libre',     390, 420,  '6:30–7:00 · Bus Errentería → Donostia.',                             0),
  (1, 1, 'trab', 'Trabajo – Inetum',              'trabajo',   420, 840,  '7:00–14:00 · Jornada laboral Inetum.',                               0),
  (1, 1, 'vuel', 'Bus → Errentería',              'libre',     840, 900,  '14:00–15:00 · Trayecto de vuelta.',                                  0),
  (1, 1, 'preg', 'Llegada / Preparar',            'libre',     900, 930,  '15:00–15:30 · Llegada a casa, preparar.',                            0),
  (1, 1, 'gym',  'Gym / entrenamiento shaolin',   'shaolin',   930, 1050, '15:30–17:30 · Gym o entrenamiento shaolin.',                         1),
  (1, 1, 'ocio', 'Ocio / Descanso',               'libre',     1050,1200, '17:30–20:00 · Descanso, recuperación, tiempo personal.',             0),
  (1, 1, 'duch', 'Ducha + Cenar',                 'prep',      1200,1260, '20:00–21:00 · Ducha y cena.',                                        0),
  (1, 1, 'lec',  'Lectura estoica',               'mente',     1260,1320, '21:00–22:00 · Salzgeber / Marco Aurelio / estoicismo.',              1);

-- Seed tareas Borja SCHED_V2 — Miércoles (day_index=2)
INSERT OR IGNORE INTO tracker_tasks (user_id, day_index, activity_id, name, cat_key, start_min, end_min, description, track) VALUES
  (1, 2, 'lev',  'Levantada',              'prep',      300, 320,  '5:00 — Levantada. No negociable.',                                    0),
  (1, 2, 'kron', 'Kronoshin',              'kronoshin', 320, 360,  '5:20–6:00 · Meditación estoica + flexibilidad shaolin unificadas.',   1),
  (1, 2, 'pre',  'Prepararse',             'prep',      360, 390,  '6:00–6:30 · Ducha fría, desayuno, salida.',                          0),
  (1, 2, 'bus',  'Bus → Donostia',         'libre',     390, 420,  '6:30–7:00 · Bus Errentería → Donostia.',                             0),
  (1, 2, 'trab', 'Trabajo – Inetum',       'trabajo',   420, 840,  '7:00–14:00 · Jornada laboral Inetum.',                               0),
  (1, 2, 'vuel', 'Bus → Errentería',       'libre',     840, 900,  '14:00–15:00 · Trayecto de vuelta.',                                  0),
  (1, 2, 'ocio', 'Comer + Ocio / Descanso','libre',     900, 1170, '15:00–19:30 · Comer, descanso y tiempo personal.',                   0),
  (1, 2, 'run',  'Running',                'cardio',    1170,1245, '19:30–20:45 · Sesión de running.',                                   1),
  (1, 2, 'duch', 'Ducha + Cenar ligero',   'prep',      1245,1320, '20:45–22:00 · Ducha, cena ligera, relax.',                           0);

-- Seed tareas Borja SCHED_V2 — Jueves (day_index=3)
INSERT OR IGNORE INTO tracker_tasks (user_id, day_index, activity_id, name, cat_key, start_min, end_min, description, track) VALUES
  (1, 3, 'lev',  'Levantada',                    'prep',      300, 320,  '5:00 — Levantada. No negociable.',                                    0),
  (1, 3, 'kron', 'Kronoshin',                    'kronoshin', 320, 360,  '5:20–6:00 · Meditación estoica + flexibilidad shaolin unificadas.',   1),
  (1, 3, 'pre',  'Prepararse',                   'prep',      360, 390,  '6:00–6:30 · Ducha fría, desayuno, salida.',                          0),
  (1, 3, 'bus',  'Bus → Donostia',               'libre',     390, 420,  '6:30–7:00 · Bus Errentería → Donostia.',                             0),
  (1, 3, 'trab', 'Trabajo – Inetum',             'trabajo',   420, 840,  '7:00–14:00 · Jornada laboral Inetum.',                               0),
  (1, 3, 'vuel', 'Bus → Errentería',             'libre',     840, 900,  '14:00–15:00 · Trayecto de vuelta.',                                  0),
  (1, 3, 'preg', 'Llegada / Preparar',           'libre',     900, 930,  '15:00–15:30 · Llegada a casa, preparar.',                            0),
  (1, 3, 'gym',  'Gym / entrenamiento shaolin',  'shaolin',   930, 1050, '15:30–17:30 · Gym o entrenamiento shaolin.',                         1),
  (1, 3, 'ocio', 'Ocio / Descanso',              'libre',     1050,1080, '17:30–18:00 · Descanso y recuperación post-entreno.',                0),
  (1, 3, 'psi',  'Psicólogo',                    'psicologo', 1080,1140, '18:00–19:00 · Sesión psicólogo.',                                    1),
  (1, 3, 'ocio2','Ocio / Descanso',              'libre',     1140,1200, '19:00–20:00 · Tiempo personal.',                                     0),
  (1, 3, 'duch', 'Ducha + Cenar',                'prep',      1200,1260, '20:00–21:00 · Ducha y cena.',                                        0),
  (1, 3, 'lec',  'Lectura estoica',              'mente',     1260,1320, '21:00–22:00 · Salzgeber / Marco Aurelio / estoicismo.',              1);

-- Seed tareas Borja SCHED_V2 — Viernes (day_index=4)
INSERT OR IGNORE INTO tracker_tasks (user_id, day_index, activity_id, name, cat_key, start_min, end_min, description, track) VALUES
  (1, 4, 'lev',  'Levantada',              'prep',      300, 320,  '5:00 — Levantada. No negociable.',                                    0),
  (1, 4, 'kron', 'Kronoshin',              'kronoshin', 320, 360,  '5:20–6:00 · Meditación estoica + flexibilidad shaolin unificadas.',   1),
  (1, 4, 'pre',  'Prepararse',             'prep',      360, 390,  '6:00–6:30 · Ducha fría, desayuno, salida.',                          0),
  (1, 4, 'bus',  'Bus → Donostia',         'libre',     390, 420,  '6:30–7:00 · Bus Errentería → Donostia.',                             0),
  (1, 4, 'trab', 'Trabajo – Inetum',       'trabajo',   420, 840,  '7:00–14:00 · Jornada laboral Inetum.',                               0),
  (1, 4, 'vuel', 'Bus → Errentería',       'libre',     840, 900,  '14:00–15:00 · Trayecto de vuelta.',                                  0),
  (1, 4, 'ocio', 'Comer + Ocio / Descanso','libre',     900, 1170, '15:00–19:30 · Comer, descanso y tiempo personal.',                   0),
  (1, 4, 'biz',  'Biziki',                 'cardio',    1170,1245, '19:30–20:45 · Grupo running BIZIKI.',                                1),
  (1, 4, 'duch', 'Ducha + Cenar ligero',   'prep',      1245,1320, '20:45–22:00 · Ducha, cena ligera, relax.',                           0);

-- Seed tareas Borja SCHED_V2 — Sábado (day_index=5)
INSERT OR IGNORE INTO tracker_tasks (user_id, day_index, activity_id, name, cat_key, start_min, end_min, description, track) VALUES
  (1, 5, 'mont', 'Monte – Correr/Pasear', 'cardio', 480,  600,  '8:00–10:00 · Salida al monte. Correr o pasear en naturaleza.', 1),
  (1, 5, 'libs', 'Día libre',             'libre',  600,  1380, '10:00 en adelante · Descanso, proyectos, vida personal.',     0);

-- Seed tareas Borja SCHED_V2 — Domingo (day_index=6)
INSERT OR IGNORE INTO tracker_tasks (user_id, day_index, activity_id, name, cat_key, start_min, end_min, description, track) VALUES
  (1, 6, 'gym',  'Gym / Shaolin', 'shaolin', 540,  660,  '9:00–11:00 · Gym o entrenamiento shaolin. Fuerza + técnica.', 1),
  (1, 6, 'libd', 'Día libre',     'libre',   660,  1380, '11:00 en adelante · Descanso, proyectos, vida personal.',    0);
