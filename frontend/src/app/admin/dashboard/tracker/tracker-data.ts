export interface Activity {
  id: string;
  name: string;
  cat: string;
  start: number;
  end: number;
  desc: string;
  track: boolean;
}

export interface Cat {
  label: string;
  color: string;
  cls: string;
}

export function tm(h: number, m = 0): number {
  return h * 60 + m;
}

export const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const DIAS_F = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const CATS: Record<string, Cat> = {
  kronoshin: { label: 'Kronoshin',        color: '#1a82b8', cls: 'ckr' },
  mente:     { label: 'Meditación/Mente', color: '#5048c8', cls: 'cm'  },
  flex:      { label: 'Flexibilidad',     color: '#0e8a68', cls: 'cf'  },
  prep:      { label: 'Prepararse',       color: '#555',    cls: 'cp'  },
  trabajo:   { label: 'Trabajo Inetum',   color: '#1a5080', cls: 'cw'  },
  cardio:    { label: 'BIZIKI/Cardio',    color: '#b03c14', cls: 'cc'  },
  shaolin:   { label: 'Shaolin/Entreno',  color: '#1e824e', cls: 'cs'  },
  psicologo: { label: 'Psicólogo',        color: '#7a32a0', cls: 'cpsi'},
  dormir:    { label: 'Dormir',           color: '#0a0e18', cls: 'cd'  },
  libre:     { label: 'Tiempo libre',     color: '#333',    cls: 'cl'  },
};

/* ── Horario original (antes del 5 de junio 2026) ── */
export const SCHED: Activity[][] = [
  // 0 — LUNES
  [
    { id: 'lev',  name: 'Levantada',              cat: 'prep',     start: tm(5,15), end: tm(5,30),  desc: '5:15 — Levantada. No negociable.',                              track: false },
    { id: 'med',  name: 'Meditación estoica',     cat: 'mente',    start: tm(5,30), end: tm(6,0),   desc: '5:30–6:00 · 30 min meditación estoica.',                        track: true  },
    { id: 'fle',  name: 'Flexibilidad',            cat: 'flex',     start: tm(6,0),  end: tm(6,30),  desc: '6:00–6:30 · Estiramientos y movilidad shaolin.',                track: true  },
    { id: 'pre',  name: 'Prepararse',              cat: 'prep',     start: tm(6,30), end: tm(7,15),  desc: '6:30–7:15 · Ducha fría, desayuno, salida.',                    track: false },
    { id: 'bus',  name: 'Bus → Donostia',          cat: 'libre',    start: tm(7,15), end: tm(8,0),   desc: '7:15–8:00 · Bus Errentería → Donostia.',                       track: false },
    { id: 'trab', name: 'Trabajo – Inetum',        cat: 'trabajo',  start: tm(8,0),  end: tm(17,0),  desc: '8:00–17:00 · Jornada completa Inetum.',                        track: false },
    { id: 'vuel', name: 'Bus → Errentería',        cat: 'libre',    start: tm(17,0), end: tm(18,0),  desc: '17:00–18:00 · Trayecto de vuelta.',                            track: false },
    { id: 'lib1', name: 'Descanso',                cat: 'libre',    start: tm(18,0), end: tm(19,30), desc: '18:00–19:30 · Descanso, preparar mochila BIZIKI.',              track: false },
    { id: 'biz',  name: 'BIZIKI Running',          cat: 'cardio',   start: tm(19,30),end: tm(21,0),  desc: '19:30–21:00 · Running grupo BIZIKI.',                          track: true  },
    { id: 'lec',  name: 'Lectura estoica',         cat: 'mente',    start: tm(21,0), end: tm(21,30), desc: '21:00–21:30 · Salzgeber / Marco Aurelio.',                     track: true  },
    { id: 'dor',  name: 'Dormir',                  cat: 'dormir',   start: tm(21,30),end: tm(23,0),  desc: '21:30 → 7–8h sueño del guerrero.',                             track: false },
  ],
  // 1 — MARTES
  [
    { id: 'lev',  name: 'Levantada',              cat: 'prep',     start: tm(5,15), end: tm(5,30),  desc: '5:15 — Levantada.',                                             track: false },
    { id: 'sha',  name: 'Entrenamiento Shaolin',  cat: 'shaolin',  start: tm(5,30), end: tm(6,30),  desc: '5:30–6:30 · Técnica shaolin + calistenia. 1 hora completa.',   track: true  },
    { id: 'pre',  name: 'Prepararse',              cat: 'prep',     start: tm(6,30), end: tm(7,15),  desc: '6:30–7:15 · Ducha fría, desayuno, salida.',                    track: false },
    { id: 'bus',  name: 'Bus → Donostia',          cat: 'libre',    start: tm(7,15), end: tm(8,0),   desc: '7:15–8:00 · Trayecto bus.',                                    track: false },
    { id: 'trab', name: 'Trabajo – Inetum',        cat: 'trabajo',  start: tm(8,0),  end: tm(17,0),  desc: '8:00–17:00 · Jornada completa Inetum.',                        track: false },
    { id: 'vuel', name: 'Bus → Errentería',        cat: 'libre',    start: tm(17,0), end: tm(18,0),  desc: '17:00–18:00 · Trayecto de vuelta.',                            track: false },
    { id: 'lib1', name: 'Descanso / Cena',         cat: 'libre',    start: tm(18,0), end: tm(19,30), desc: '18:00–19:30 · Descanso, cena ligera.',                         track: false },
    { id: 'gym',  name: 'Gym / Shaolin Arramendi', cat: 'shaolin',  start: tm(19,30),end: tm(20,30), desc: '19:30–20:30 · Gym o entrenamiento shaolin en Arramendi.',      track: true  },
    { id: 'lib2', name: 'Descanso',                cat: 'libre',    start: tm(20,30),end: tm(21,0),  desc: '20:30–21:00 · Recuperación post-entreno.',                     track: false },
    { id: 'lec',  name: 'Lectura estoica',         cat: 'mente',    start: tm(21,0), end: tm(21,30), desc: '21:00–21:30 · Lectura filosofía estoica.',                     track: true  },
    { id: 'dor',  name: 'Dormir',                  cat: 'dormir',   start: tm(21,30),end: tm(23,0),  desc: '21:30 → Sueño reparador.',                                     track: false },
  ],
  // 2 — MIÉRCOLES
  [
    { id: 'lev',  name: 'Levantada',              cat: 'prep',     start: tm(5,15), end: tm(5,30),  desc: '5:15 — Levantada.',                                             track: false },
    { id: 'med',  name: 'Meditación estoica',     cat: 'mente',    start: tm(5,30), end: tm(6,0),   desc: '5:30–6:00 · 30 min meditación.',                               track: true  },
    { id: 'fle',  name: 'Flexibilidad',            cat: 'flex',     start: tm(6,0),  end: tm(6,30),  desc: '6:00–6:30 · Estiramientos y movilidad.',                       track: true  },
    { id: 'pre',  name: 'Prepararse',              cat: 'prep',     start: tm(6,30), end: tm(7,15),  desc: '6:30–7:15 · Ducha fría, desayuno, salida.',                    track: false },
    { id: 'bus',  name: 'Bus → Donostia',          cat: 'libre',    start: tm(7,15), end: tm(8,0),   desc: '7:15–8:00 · Trayecto bus.',                                    track: false },
    { id: 'trab', name: 'Trabajo – Inetum',        cat: 'trabajo',  start: tm(8,0),  end: tm(17,0),  desc: '8:00–17:00 · Jornada completa Inetum.',                        track: false },
    { id: 'vuel', name: 'Bus → Errentería',        cat: 'libre',    start: tm(17,0), end: tm(18,0),  desc: '17:00–18:00 · Trayecto de vuelta.',                            track: false },
    { id: 'lib1', name: 'Descanso / Cena',         cat: 'libre',    start: tm(18,0), end: tm(19,30), desc: '18:00–19:30 · Descanso.',                                      track: false },
    { id: 'rent', name: 'Running',                 cat: 'cardio',   start: tm(19,30),end: tm(21,0),  desc: '19:30–21:00 · Sesión de running.',                             track: true  },
    { id: 'lec',  name: 'Lectura estoica',         cat: 'mente',    start: tm(21,0), end: tm(21,30), desc: '21:00–21:30 · Lectura filosofía.',                             track: true  },
    { id: 'dor',  name: 'Dormir',                  cat: 'dormir',   start: tm(21,30),end: tm(23,0),  desc: '21:30 → Sueño reparador.',                                     track: false },
  ],
  // 3 — JUEVES
  [
    { id: 'lev',  name: 'Levantada',              cat: 'prep',     start: tm(5,15), end: tm(5,30),  desc: '5:15 — Levantada.',                                             track: false },
    { id: 'sha',  name: 'Entrenamiento Shaolin',  cat: 'shaolin',  start: tm(5,30), end: tm(6,30),  desc: '5:30–6:30 · Técnica shaolin + calistenia. 1 hora completa.',   track: true  },
    { id: 'pre',  name: 'Prepararse',              cat: 'prep',     start: tm(6,30), end: tm(7,15),  desc: '6:30–7:15 · Ducha fría, desayuno, salida.',                    track: false },
    { id: 'bus',  name: 'Bus → Donostia',          cat: 'libre',    start: tm(7,15), end: tm(8,0),   desc: '7:15–8:00 · Trayecto bus.',                                    track: false },
    { id: 'trab', name: 'Trabajo – Inetum',        cat: 'trabajo',  start: tm(8,0),  end: tm(17,0),  desc: '8:00–17:00 · Jornada completa Inetum.',                        track: false },
    { id: 'libj', name: 'Trayecto / Preparar',    cat: 'libre',    start: tm(17,0), end: tm(18,0),  desc: '17:00–18:00 · Trayecto hacia psicólogo.',                      track: false },
    { id: 'psi',  name: 'Psicólogo',              cat: 'psicologo',start: tm(18,0), end: tm(19,0),  desc: '18:00–19:00 · Sesión psicólogo, Donostia.',                    track: true  },
    { id: 'gym',  name: 'Gym / Shaolin Arramendi', cat: 'shaolin',  start: tm(19,30),end: tm(20,30), desc: '19:30–20:30 · Gym o entrenamiento shaolin en Arramendi.',      track: true  },
    { id: 'lib2', name: 'Descanso',                cat: 'libre',    start: tm(20,30),end: tm(21,0),  desc: '20:30–21:00 · Recuperación.',                                  track: false },
    { id: 'lec',  name: 'Lectura estoica',         cat: 'mente',    start: tm(21,0), end: tm(21,30), desc: '21:00–21:30 · Lectura filosofía.',                             track: true  },
    { id: 'dor',  name: 'Dormir',                  cat: 'dormir',   start: tm(21,30),end: tm(23,0),  desc: '21:30 → Sueño reparador.',                                     track: false },
  ],
  // 4 — VIERNES
  [
    { id: 'lev',  name: 'Levantada',              cat: 'prep',     start: tm(5,15), end: tm(5,30),  desc: '5:15 — Levantada.',                                             track: false },
    { id: 'med',  name: 'Meditación estoica',     cat: 'mente',    start: tm(5,30), end: tm(6,0),   desc: '5:30–6:00 · 30 min meditación.',                               track: true  },
    { id: 'fle',  name: 'Flexibilidad',            cat: 'flex',     start: tm(6,0),  end: tm(6,30),  desc: '6:00–6:30 · Estiramientos y movilidad.',                       track: true  },
    { id: 'pre',  name: 'Prepararse',              cat: 'prep',     start: tm(6,30), end: tm(7,15),  desc: '6:30–7:15 · Ducha fría, desayuno, salida.',                    track: false },
    { id: 'bus',  name: 'Bus → Donostia',          cat: 'libre',    start: tm(7,15), end: tm(8,0),   desc: '7:15–8:00 · Trayecto bus.',                                    track: false },
    { id: 'trab', name: 'Trabajo – Inetum',        cat: 'trabajo',  start: tm(8,0),  end: tm(13,0),  desc: '8:00–13:00 · Media jornada. Tarde libre desde 14:00.',         track: false },
    { id: 'vuel', name: 'Bus → Errentería',        cat: 'libre',    start: tm(13,0), end: tm(14,0),  desc: '13:00–14:00 · Vuelta temprana.',                               track: false },
    { id: 'libv', name: 'Tarde libre',             cat: 'libre',    start: tm(14,0), end: tm(19,30), desc: '14:00–19:30 · Proyectos dev, descanso, vida personal.',        track: false },
    { id: 'biz',  name: 'BIZIKI Running',          cat: 'cardio',   start: tm(19,30),end: tm(21,0),  desc: '19:30–21:00 · Running grupo BIZIKI.',                          track: true  },
    { id: 'lec',  name: 'Lectura estoica',         cat: 'mente',    start: tm(21,0), end: tm(21,30), desc: '21:00–21:30 · Lectura filosofía.',                             track: true  },
    { id: 'dor',  name: 'Dormir',                  cat: 'dormir',   start: tm(21,30),end: tm(23,0),  desc: '21:30 → Sueño reparador.',                                     track: false },
  ],
  // 5 — SÁBADO
  [
    { id: 'mont', name: 'Monte – Correr/Pasear',  cat: 'cardio',   start: tm(8,0),  end: tm(10,0),  desc: '8:00–10:00 · Salida al monte. Correr o pasear en naturaleza.', track: true  },
    { id: 'libs', name: 'Día libre',              cat: 'libre',    start: tm(10,0), end: tm(23,0),  desc: '10:00 en adelante · Descanso, proyectos, vida personal.',       track: false },
  ],
  // 6 — DOMINGO
  [
    { id: 'gym',  name: 'Gym / Shaolin',          cat: 'shaolin',  start: tm(9,0),  end: tm(11,0),  desc: '9:00–11:00 · Gym o entrenamiento shaolin. Fuerza + técnica.',  track: true  },
    { id: 'libd', name: 'Día libre',              cat: 'libre',    start: tm(11,0), end: tm(23,0),  desc: '11:00 en adelante · Descanso, proyectos, vida personal.',       track: false },
  ],
];

/* ── A partir del 5 de junio 2026 ── */
export const SCHED_SWITCH = '2026-06-05'; // YYYY-MM-DD

/* Mañana común a todos los días laborales V2 */
const V2_MORNING = (id_suffix = ''): Activity[] => [
  { id: 'lev',          name: 'Levantada',       cat: 'prep',      start: tm(5,0),  end: tm(5,20),  desc: '5:00 — Levantada. No negociable.',           track: false },
  { id: 'kron'+id_suffix,name: 'Kronoshin',      cat: 'kronoshin', start: tm(5,20), end: tm(6,0),   desc: '5:20–6:00 · Meditación estoica + flexibilidad shaolin unificadas.', track: true },
  { id: 'pre',          name: 'Prepararse',       cat: 'prep',      start: tm(6,0),  end: tm(6,30),  desc: '6:00–6:30 · Ducha fría, desayuno, salida.',  track: false },
  { id: 'bus',          name: 'Bus → Donostia',   cat: 'libre',     start: tm(6,30), end: tm(7,0),   desc: '6:30–7:00 · Bus Errentería → Donostia.',     track: false },
  { id: 'trab',         name: 'Trabajo – Inetum', cat: 'trabajo',   start: tm(7,0),  end: tm(14,0),  desc: '7:00–14:00 · Jornada laboral Inetum.',       track: false },
  { id: 'vuel',         name: 'Bus → Errentería', cat: 'libre',     start: tm(14,0), end: tm(15,0),  desc: '14:00–15:00 · Trayecto de vuelta.',           track: false },
];

export const SCHED_V2: Activity[][] = [
  // 0 — LUNES
  [
    ...V2_MORNING(),
    { id: 'ocio',  name: 'Comer + Ocio / Descanso', cat: 'libre',   start: tm(15,0),  end: tm(19,30), desc: '15:00–19:30 · Comer, descanso y tiempo personal.', track: false },
    { id: 'biz',   name: 'Biziki',                  cat: 'cardio',  start: tm(19,30), end: tm(20,45), desc: '19:30–20:45 · Grupo running BIZIKI.',               track: true  },
    { id: 'duch',  name: 'Ducha + Cenar ligero',    cat: 'prep',    start: tm(20,45), end: tm(22,0),  desc: '20:45–22:00 · Ducha, cena ligera, relax.',          track: false },
  ],
  // 1 — MARTES
  [
    ...V2_MORNING(),
    { id: 'preg',  name: 'Llegada / Preparar',          cat: 'libre',   start: tm(15,0),  end: tm(15,30), desc: '15:00–15:30 · Llegada a casa, preparar.',                   track: false },
    { id: 'gym',   name: 'Gym / entrenamiento shaolin', cat: 'shaolin', start: tm(15,30), end: tm(17,30), desc: '15:30–17:30 · Gym o entrenamiento shaolin.',                 track: true  },
    { id: 'ocio',  name: 'Ocio / Descanso',             cat: 'libre',   start: tm(17,30), end: tm(20,0),  desc: '17:30–20:00 · Descanso, recuperación, tiempo personal.',     track: false },
    { id: 'duch',  name: 'Ducha + Cenar',               cat: 'prep',    start: tm(20,0),  end: tm(21,0),  desc: '20:00–21:00 · Ducha y cena.',                                track: false },
    { id: 'lec',   name: 'Lectura estoica',             cat: 'mente',   start: tm(21,0),  end: tm(22,0),  desc: '21:00–22:00 · Salzgeber / Marco Aurelio / estoicismo.',      track: true  },
  ],
  // 2 — MIÉRCOLES
  [
    ...V2_MORNING(),
    { id: 'ocio',  name: 'Comer + Ocio / Descanso', cat: 'libre',   start: tm(15,0),  end: tm(19,30), desc: '15:00–19:30 · Comer, descanso y tiempo personal.', track: false },
    { id: 'run',   name: 'Running',                  cat: 'cardio',  start: tm(19,30), end: tm(20,45), desc: '19:30–20:45 · Sesión de running.',                  track: true  },
    { id: 'duch',  name: 'Ducha + Cenar ligero',     cat: 'prep',    start: tm(20,45), end: tm(22,0),  desc: '20:45–22:00 · Ducha, cena ligera, relax.',          track: false },
  ],
  // 3 — JUEVES
  [
    ...V2_MORNING(),
    { id: 'preg',  name: 'Llegada / Preparar',          cat: 'libre',   start: tm(15,0),  end: tm(15,30), desc: '15:00–15:30 · Llegada a casa, preparar.',                   track: false },
    { id: 'gym',   name: 'Gym / entrenamiento shaolin', cat: 'shaolin', start: tm(15,30), end: tm(17,30), desc: '15:30–17:30 · Gym o entrenamiento shaolin.',                 track: true  },
    { id: 'ocio',  name: 'Ocio / Descanso',             cat: 'libre',   start: tm(17,30), end: tm(18,0),  desc: '17:30–18:00 · Descanso y recuperación post-entreno.',        track: false },
    { id: 'psi',   name: 'Psicólogo',                   cat: 'psicologo',start: tm(18,0), end: tm(19,0),  desc: '18:00–19:00 · Sesión psicólogo.',                            track: true  },
    { id: 'ocio2', name: 'Ocio / Descanso',             cat: 'libre',   start: tm(19,0),  end: tm(20,0),  desc: '19:00–20:00 · Tiempo personal.',                             track: false },
    { id: 'duch',  name: 'Ducha + Cenar',               cat: 'prep',    start: tm(20,0),  end: tm(21,0),  desc: '20:00–21:00 · Ducha y cena.',                                track: false },
    { id: 'lec',   name: 'Lectura estoica',             cat: 'mente',   start: tm(21,0),  end: tm(22,0),  desc: '21:00–22:00 · Salzgeber / Marco Aurelio / estoicismo.',      track: true  },
  ],
  // 4 — VIERNES
  [
    ...V2_MORNING(),
    { id: 'ocio',  name: 'Comer + Ocio / Descanso', cat: 'libre',   start: tm(15,0),  end: tm(19,30), desc: '15:00–19:30 · Comer, descanso y tiempo personal.', track: false },
    { id: 'biz',   name: 'Biziki',                  cat: 'cardio',  start: tm(19,30), end: tm(20,45), desc: '19:30–20:45 · Grupo running BIZIKI.',               track: true  },
    { id: 'duch',  name: 'Ducha + Cenar ligero',    cat: 'prep',    start: tm(20,45), end: tm(22,0),  desc: '20:45–22:00 · Ducha, cena ligera, relax.',          track: false },
  ],
  // 5 — SÁBADO (igual que V1)
  [
    { id: 'mont', name: 'Monte – Correr/Pasear',  cat: 'cardio',   start: tm(8,0),  end: tm(10,0),  desc: '8:00–10:00 · Salida al monte. Correr o pasear en naturaleza.', track: true  },
    { id: 'libs', name: 'Día libre',              cat: 'libre',    start: tm(10,0), end: tm(23,0),  desc: '10:00 en adelante · Descanso, proyectos, vida personal.',       track: false },
  ],
  // 6 — DOMINGO (igual que V1)
  [
    { id: 'gym',  name: 'Gym / Shaolin',          cat: 'shaolin',  start: tm(9,0),  end: tm(11,0),  desc: '9:00–11:00 · Gym o entrenamiento shaolin. Fuerza + técnica.',  track: true  },
    { id: 'libd', name: 'Día libre',              cat: 'libre',    start: tm(11,0), end: tm(23,0),  desc: '11:00 en adelante · Descanso, proyectos, vida personal.',       track: false },
  ],
];
