"use client";

import { useCardHolo } from "@/hooks/useCardHolo";
import HojaDeRuta from "@/components/sections/HojaDeRuta";

/* ============================
   FORMACIÓN

   Se lee como un recorrido en orden cronológico:
   1. Formación técnica (oficio)
   2. El cambio de sector
   3. Formación en desarrollo ya realizada (IFCD0112 destacada)
   4. Hoja de ruta de lo que viene (HojaDeRuta)

   Las dos primeras filas comparten estética: tarjetas de izquierda a derecha
   con una flecha que marca el sentido del tiempo. Misma información que los
   CV (invariante 5).
============================ */

interface Titulo {
  titulo: string;
  nivel: string;
  centro: string;
  periodo: string;
  nota?: string;
  tecnologias?: string[];
  /** Diploma escaneado en /images, si existe. */
  diploma?: string;
  /** Titulación oficial: se destaca sobre el resto de la fila. */
  oficial?: boolean;
}

/* Del más antiguo al más reciente. Carpintería está cursada pero sin el
   módulo de prácticas, y así se dice. */
const FORMACION_TECNICA: Titulo[] = [
  {
    titulo: "Técnico en Mecanizado",
    nivel: "F.P. Grado Medio",
    centro: "Irungo La Salle",
    periodo: "2010",
  },
  {
    titulo: "Técnico en Instalaciones Eléctricas y Automáticas",
    nivel: "F.P. Grado Medio",
    centro: "Irungo La Salle",
    periodo: "2012 – 2014",
    nota: "Título válido para trabajar como instalador en baja tensión (REBT)",
  },
  {
    titulo: "Carpintería y Mueble",
    nivel: "F.P. Grado Medio · cursado",
    centro: "Centro Bidasoa (Irun)",
    periodo: "2016 – 2018",
    nota: "Pendiente del módulo de prácticas",
  },
];

/* Del más antiguo al más reciente. La IFCD0112 es lo único con validez
   oficial del bloque: va destacada, pero en su sitio cronológico. */
const FORMACION_DESARROLLO: Titulo[] = [
  {
    titulo: "Confección y Publicación de Páginas Web",
    nivel: "Curso intensivo · LANBIDE",
    centro: "CEINPRO",
    periodo: "2019 – 2020",
    tecnologias: ["HTML / CSS", "JavaScript", "jQuery", "PHP", "Bootstrap", "WordPress", "Git"],
    diploma: "/images/diploma_ceinpro.png",
  },
  {
    titulo: "Certificado de Profesionalidad IFCD0112",
    nivel: "Nivel 3 · Titulación oficial",
    centro: "Ipartek",
    periodo: "2021",
    nota: "Programación con lenguajes orientados a objetos y bases de datos relacionales",
    tecnologias: ["Java", "Spring", "JSP / JDBC", "Thymeleaf", "Maven", "MySQL"],
    diploma: "/images/diploma_ipartek.jpg",
    oficial: true,
  },
  {
    titulo: "Aprende Oracle PL/SQL desde Cero",
    nivel: "Curso · 12 horas",
    centro: "Udemy",
    periodo: "2025",
    tecnologias: ["Cursores", "Procedimientos", "Funciones", "Paquetes", "Triggers"],
    diploma: "/images/diploma_PLSQL_udemy.jpg",
  },
];

/* Fila cronológica: flecha con el primer y el último año encima y una
   tarjeta por título. En móvil se apila y la flecha sobra. Los extremos se
   sacan de los datos para que no se desincronicen al añadir un título. */
const anios = (periodo: string) => periodo.match(/\d{4}/g) ?? [];

function FilaCronologica({ items }: { items: Titulo[] }) {
  const holo = useCardHolo();
  const desde = anios(items[0]?.periodo ?? "")[0] ?? "";
  const hasta = anios(items[items.length - 1]?.periodo ?? "").slice(-1)[0] ?? "";

  return (
    <>
      <div className="hidden md:flex items-center gap-3 mb-4 text-xs text-gray-500 dark:text-gray-400" aria-hidden="true">
        <span>{desde}</span>
        <span className="flex-1 h-px bg-cyan-400/60" />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 -ml-3 text-primary">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
        </svg>
        <span>{hasta}</span>
      </div>

      <ul className="grid gap-5 md:grid-cols-3">
        {items.map((f) => (
          <li
            key={f.titulo}
            {...(f.oficial ? holo : {})}
            className={
              f.oficial
                ? "card-holo rounded-lg border-2 border-cyan-400 bg-cyan-400/[0.05] dark:bg-cyan-400/[0.07] p-4"
                : "border-l-2 border-cyan-400/60 pl-4"
            }
          >
            {f.oficial && (
              <>
                <span className="card-holo-shine" aria-hidden />
                <span className="card-holo-noise" aria-hidden />
                <span className="inline-block mb-2 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border border-cyan-400 text-primary bg-cyan-400/10">
                  Titulación oficial
                </span>
              </>
            )}
            <span className="block font-medium text-gray-800 dark:text-gray-200">{f.titulo}</span>
            <span className={`block text-sm ${f.oficial ? "text-primary font-medium" : "text-gray-600 dark:text-gray-400"}`}>
              {f.nivel}
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-500">
              {f.centro} · {f.periodo}
            </span>
            {f.nota && (
              <span className={`block mt-1 text-xs ${f.oficial ? "text-gray-600 dark:text-gray-400" : "text-primary"}`}>
                {f.nota}
              </span>
            )}
            {f.tecnologias && (
              <span className="flex flex-wrap gap-1 mt-2.5">
                {f.tecnologias.map((t) => (
                  <span key={t} className="px-1.5 py-0.5 text-[11px] rounded border border-cyan-400/40 text-primary">
                    {t}
                  </span>
                ))}
              </span>
            )}
            {f.diploma && (
              <a
                href={f.diploma}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 inline-block mt-2.5 text-xs text-primary hover:underline"
              >
                Ver diploma ↗
              </a>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

export default function Aprendizaje() {
  return (
    <section id="aprendizaje" className="max-w-6xl mx-auto px-6 py-32">
      <h2 className="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
        <span className="text-primary text-4xl">⌁</span>
        Formación
      </h2>

      {/* TEXTO SEO DISCRETO */}
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-3xl mb-12">
        De la <strong>formación profesional técnica</strong> al{" "}
        <strong>desarrollo de software</strong>, con un certificado oficial de
        nivel 3 en programación orientada a objetos y bases de datos, y una
        hoja de ruta abierta hacia arquitectura, cloud e{" "}
        <strong>IA aplicada</strong>.
      </p>

      {/* 1 · FORMACIÓN TÉCNICA */}
      <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-5">
        Formación técnica · oficio
      </h3>
      <FilaCronologica items={FORMACION_TECNICA} />

      {/* 2 · CAMBIO DE SECTOR — el empalme entre las dos filas. La pista pasa
          de gris (taller) a cian (software), el mismo código de color que la
          trayectoria del hero. */}
      <div className="my-14 flex gap-5 max-w-3xl">
        <span
          className="w-0.5 flex-shrink-0 rounded-full bg-gradient-to-b from-gray-400 to-cyan-400 dark:from-gray-600"
          aria-hidden="true"
        />
        <div>
          <p className="text-xs uppercase tracking-widest text-primary mb-2">2019 · cambio de sector</p>
          <p className="text-lg sm:text-xl text-gray-800 dark:text-gray-200 leading-relaxed">
            Cambié el taller por el código porque me fascinó. En el software
            encontré lo que me gustaba del oficio —planos, piezas que tienen que
            encajar, un resultado que funciona o no funciona—, pero sin límite de
            material.
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Dos años de transición planificada después, estaba programando para
            el Gobierno Vasco.
          </p>
        </div>
      </div>

      {/* 3 · FORMACIÓN EN DESARROLLO — ya realizada */}
      <h3 className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-5 flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="w-4 h-4" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Formación en desarrollo · realizada
      </h3>
      <FilaCronologica items={FORMACION_DESARROLLO} />

      {/* 4 · HOJA DE RUTA — lo que viene */}
      <HojaDeRuta />
    </section>
  );
}
