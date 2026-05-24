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
  mente:     { label: 'Meditación/Mente', color: '#3a3280', cls: 'cm' },
  flex:      { label: 'Flexibilidad',     color: '#0d5e48', cls: 'cf' },
  prep:      { label: 'Prepararse',       color: '#222',    cls: 'cp' },
  trabajo:   { label: 'Trabajo Inetum',   color: '#0e2d4a', cls: 'cw' },
  cardio:    { label: 'BIZIKI/Cardio',    color: '#6a2308', cls: 'cc' },
  shaolin:   { label: 'Shaolin/Entreno',  color: '#155234', cls: 'cs' },
  psicologo: { label: 'Psicólogo',        color: '#4a2060', cls: 'cpsi' },
  dormir:    { label: 'Dormir',           color: '#0a0e18', cls: 'cd' },
  libre:     { label: 'Tiempo libre',     color: '#141414', cls: 'cl' },
};

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
