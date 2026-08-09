"use client";

import { useCardHolo } from "@/hooks/useCardHolo";

/* Titulación oficial: va destacada y aparte del resto de cursos, porque es
   lo único con validez académica del bloque y antes se presentaba como
   «Curso Java POO & BD relacionales», que la infravaloraba. */
const CERTIFICADO = {
  codigo: "IFCD0112 — Nivel 3",
  titulo:
    "Programación con lenguajes orientados a objetos y bases de datos relacionales",
  centro: "Ipartek",
  anio: "2021",
  tecnologias: [
    "Java",
    "Spring",
    "JSP / JDBC / Thymeleaf",
    "Lombok / Maven",
    "JavaScript / jQuery",
    "MySQL Workbench",
  ],
  link: "/images/diploma_ipartek.jpg",
};

/* Formación reglada previa a la reconversión al desarrollo. */
const FP_MEDIO = [
  { titulo: "F.P. Grado Medio — Electricidad", centro: "Irungo La Salle", anio: "2012-2014" },
  { titulo: "F.P. Grado Medio — Mecanizado",   centro: "Irungo La Salle", anio: "2008-2010" },
];

export default function Aprendizaje() {
  const holo = useCardHolo();
  const cursos = [
    {
      titulo: "Confección y Publicación de Páginas Web — Ceinpro",
      descripcion:
        "Curso intensivo de iniciación a la programación web, aprobado por LANBIDE-Servicio Vasco de Empleo. Centro: CEINPRO Centro Informático Profesional.",
      tecnologias: [
        "HTML / CSS",
        "JavaScript / jQuery",
        "PHP",
        "Bootstrap",
        "WordPress",
        "Node.js",
        "Git",
      ],
      link: "/images/diploma_ceinpro.png",
    },
    {
      titulo: "Curso de Oracle PL/SQL desde Cero - Udemy",
      descripcion: "Curso intensivo de Oracle PL/SQL para principiantes.",
      tecnologias: [
        "Bloques",
        "Excepciones",
        "Cursores",
        "Procedimientos almacenados",
        "Funciones",
        "Paquetes",
        "Triggers",
      ],
      link: "/images/diploma_PLSQL_udemy.jpg",
    },
    {
      titulo: "Universidad Java – Cero a Experto – Udemy",
      descripcion:
        "Formación avanzada en Java y su ecosistema, desde fundamentos hasta frameworks.",
      tecnologias: [
        "Java",
        "Spring",
        "JSP / JDBC / Thymeleaf",
        "Lombok / Maven",
        "Angular",
        "Struts",
      ],
      link: "https://www.udemy.com/course/universidad-java-especialista-en-java-desde-cero-a-master/",
      estado: "en-curso",
    },
  ];

  const aprendiendo1 = {
    titulo: "React y stack NoSQL",
    descripcion:
      "Tecnologías aplicadas en proyectos personales como Unyona y BAKO:",
    tecnologias: ["React", "TypeScript", "MongoDB", "Express", "Tailwind"],
    estado: "en-curso",
  };

  const aprendiendo2 = {
    titulo: "Angular y Spring Boot",
    descripcion:
      "Tecnologías utilizadas en el desarrollo de la aplicación Diamadmin:",
    tecnologias: [
      "Angular",
      "Spring Boot",
      "PostgreSQL",
      "Arquitectura modular",
    ],
    estado: "en-curso",
  };

  return (
    <section id="aprendizaje" className="max-w-6xl mx-auto px-6 py-32">
      <h2 className="text-3xl font-bold text-black dark:text-white mb-4 flex items-center gap-3">
        <span className="text-primary text-4xl">⌁</span>
        Formación
      </h2>

      {/* TEXTO SEO DISCRETO */}
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-3xl mb-12">
        Mi formación en <strong>desarrollo web</strong> combina una titulación
        oficial de nivel 3, formación técnica especializada en{" "}
        <strong>Java y bases de datos relacionales</strong> y aprendizaje
        autodidacta continuo, aplicado directamente en proyectos reales.
      </p>

      {/* CERTIFICADO DE PROFESIONALIDAD — titulación oficial */}
      <a
        href={CERTIFICADO.link}
        target="_blank"
        rel="noopener noreferrer"
        {...holo}
        className="card-holo block rounded-lg p-6 sm:p-8 mb-10 border-2 border-cyan-400 bg-cyan-400/[0.04] dark:bg-cyan-400/[0.06]"
      >
        <span className="card-holo-shine" aria-hidden />
        <span className="card-holo-noise" aria-hidden />

        <span className="inline-block text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full border border-cyan-400 text-primary bg-cyan-400/10">
          Titulación oficial
        </span>

        <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white mt-4">
          Certificado de Profesionalidad{" "}
          <span className="text-primary">{CERTIFICADO.codigo}</span>
        </h3>

        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mt-2 max-w-2xl">
          {CERTIFICADO.titulo}
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {CERTIFICADO.centro} · {CERTIFICADO.anio}
        </p>

        <ul className="flex flex-wrap gap-2 mt-5">
          {CERTIFICADO.tecnologias.map((t) => (
            <li
              key={t}
              className="px-2.5 py-1 text-xs sm:text-sm font-medium rounded border border-cyan-400/50 text-primary"
            >
              {t}
            </li>
          ))}
        </ul>
      </a>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {/* CURSOS */}
        {cursos.map((c, i) => (
          <a
            key={i}
            href={c.link}
            target="_blank"
            rel="noopener noreferrer"
            {...holo}
            className="card-holo block border border-cyan-400 rounded-lg p-6 bg-white dark:bg-[#0d0d0d]"
          >
            <span className="card-holo-shine" aria-hidden />
            <span className="card-holo-noise"  aria-hidden />
            <span className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full border border-cyan-400 text-primary bg-cyan-400/10">
              {c.estado === "en-curso" ? "En curso" : "Completado"}
            </span>

            <div className="flex gap-3 items-start mt-6">
              {/* ICONO FORMACIÓN */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-6 h-6 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 14l9-5-9-5-9 5 9 5z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5c-2.28 0-4.418-.636-6.16-1.922L12 14z"
                />
              </svg>

              <h3 className="text-lg font-semibold text-black dark:text-white">
                {c.titulo}
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {c.descripcion}
            </p>

            <ul className="list-disc pl-5 mt-4 space-y-1 text-gray-700 dark:text-gray-300">
              {c.tecnologias.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
            <span className="mt-1 ml-2 inline-block text-lg text-primary font-medium">
              ...
            </span>
          </a>
        ))}

        {/* CONOCIMIENTOS ACTUALES */}
        {[aprendiendo1, aprendiendo2].map((a, i) => (
          <div
            key={i}
            {...holo}
            className="card-holo border border-cyan-400 rounded-lg p-6 bg-white dark:bg-[#0d0d0d]"
          >
            <span className="card-holo-shine" aria-hidden />
            <span className="card-holo-noise"  aria-hidden />
            <span className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full border border-cyan-400 text-primary bg-cyan-400/10">
              {a.estado === "en-curso" ? "En curso" : "Completado"}
            </span>

            {/* ICONO DESARROLLO */}
            <div className="flex gap-3 items-start mt-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-6 h-6 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 18l6-6-6-6M8 6l-6 6 6 6"
                />
              </svg>

              <h3 className="text-lg font-semibold text-black dark:text-white">
                {a.titulo}
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {a.descripcion}
            </p>

            <ul className="list-disc pl-5 mt-4 space-y-1 text-gray-700 dark:text-gray-300">
              {a.tecnologias.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
            <span className="mt-1 ml-2 inline-block text-lg text-primary font-medium">
              ...
            </span>
          </div>
        ))}
      </div>

      {/* FORMACIÓN REGLADA PREVIA — discreta, en una línea por título */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">
          Formación reglada previa
        </h3>
        <ul className="flex flex-col sm:flex-row gap-4 sm:gap-10">
          {FP_MEDIO.map((f) => (
            <li key={f.titulo} className="flex items-baseline gap-3">
              <span className="text-primary" aria-hidden>▸</span>
              <span>
                <span className="block text-gray-700 dark:text-gray-300">{f.titulo}</span>
                <span className="block text-xs text-gray-500 dark:text-gray-500">
                  {f.centro} · {f.anio}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
