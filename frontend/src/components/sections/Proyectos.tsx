"use client";

import { useCardHolo } from "@/hooks/useCardHolo";

export default function Proyectos() {
  const holo = useCardHolo();
  const proyectos = [
    {
      nombre: "Unyona",
      slug: "unyona",
      descripcion1:
        "Plataforma social orientada a eventos y gestión de comunidades.",
      descripcion2:
        "Se ha desarrollado una landing como demostración de la arquitectura y funcionalidades del proyecto, análisis del producto y captación de leads.",
      landing: "https://unyona.com",
      arquitectura: "Web App SQL",
      tecnologias: [
        "React",
        "TypeScript",
        "Tailwind",
        "Express",
        "Prisma",
        "SQLite",
        "PostgreSQL",
      ],
      github: "https://github.com/bohdeveloper/unyona",
    },
    {
      nombre: "Diamadmin",
      slug: "diamadmin",
      descripcion1:
        "Aplicación de gestión administrativa modular y altamente configurable.",
      descripcion2:
        "Se ha desarrollado una landing como demostración de la arquitectura y funcionalidades del proyecto, análisis del producto y captación de leads.",
      landing: "https://diamadmin.com",
      arquitectura: "Arquitectura modular",
      tecnologias: ["Angular", "Spring Boot", "PostgreSQL"],
      github: "https://github.com/bohdeveloper/diamadmin",
    },
    {
      nombre: "Nitflex",
      slug: "nitflex",
      descripcion:
        "Aplicación web de streaming educativo inspirada en Netflix, desarrollada como proyecto de aprendizaje full stack.",
      arquitectura: "Web App didáctica NoSQL",
      tecnologias: [
        "React",
        "TypeScript",
        "Tailwind",
        "Express",
        "Mongoose",
        "MongoDB",
        "TMDB API",
      ],
      github: "https://github.com/bohdeveloper/nitflex",
    },
    {
      nombre: "DevHelper",
      slug: "devhelper",
      descripcion:
        "Herramienta de apoyo al desarrollo web full stack, orientada a productividad.",
      arquitectura: "Monorepo",
      tecnologias: [
        "JSP",
        "HTML",
        "CSS",
        "Bootstrap",
        "JavaScript",
        "jQuery",
        "AJAX",
        "Spring Boot MVC",
        "SQLite",
      ],
      github: "https://github.com/bohdeveloper/devhelper",
    },
  ];

  return (
    <section id="proyectos" className="max-w-6xl mx-auto px-6 py-32">
      {/* H1 SEO */}
      <h1 className="text-4xl font-bold text-black dark:text-white mb-6 gap-3 flex items-center">
      <span className="text-primary text-4xl">⌁</span>
        Proyectos de desarrollo web
      </h1>

      {/* TEXTO SEO INTRODUCTORIO */}
      <p className="text-gray-700 dark:text-gray-300 max-w-3xl mb-14 text-lg leading-relaxed">
        En esta sección presento algunos de los{" "}
        <strong>proyectos de desarrollo web</strong> que he creado como{" "}
        <strong>programador web</strong>. Cada proyecto refleja mi experiencia
        trabajando con distintas arquitecturas, tecnologías frontend y backend,
        así como mi enfoque en crear aplicaciones funcionales y escalables.
      </p>

      <div className="grid gap-10 md:grid-cols-2">
        {proyectos.map((p, i) => (
          <article
            key={i}
            {...holo}
            className={`
              card-holo
              flex flex-col h-full rounded-lg p-6
              bg-white dark:bg-[#0d0d0d]
              border-2
              ${
                p.landing
                  ? "border-primary cursor-pointer"
                  : "border-gray-300 dark:border-gray-700"
              }
            `}
          >
            <span className="card-holo-shine" aria-hidden />
            <span className="card-holo-noise"  aria-hidden />
            <div className="flex-1">
              <span className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full border border-cyan-400 text-primary bg-cyan-400/10 dark:bg-cyan-400/20">
                En desarrollo
              </span>

              {/* Stretched link: cubre toda la card, el botón GitHub queda encima con z-10 */}
              <h2 className="text-2xl font-semibold text-black dark:text-white">
                {p.landing ? (
                  <a
                    href={p.landing}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="after:absolute after:inset-0 focus:outline-none"
                    aria-label={`Ver ${p.nombre}`}
                  >
                    {p.nombre}
                  </a>
                ) : (
                  p.nombre
                )}
              </h2>

              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                {p.descripcion}
              </p>

              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                {p.descripcion1}
              </p>

              <p className="text-sm text-primary mt-2 pr-14">
                {p.descripcion2}
              </p>

              {p.landing ? (
                <div className="my-6 border-t border-primary" />
              ) : (
                <div className="my-6 border-t border-gray-200 dark:border-gray-700" />
              )}

              <p className="text-lg text-primary mt-3 font-medium">
                {p.arquitectura}
              </p>

              {p.landing ? (
                <div className="my-6 border-t border-primary" />
              ) : (
                <div className="my-6 border-t border-gray-200 dark:border-gray-700" />
              )}

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-black dark:text-white mb-2">
                  Tecnologías utilizadas
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                  {p.tecnologias.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* z-10 para quedar encima del stretched link */}
            <a
              href={p.github}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 mt-6 inline-block text-center px-4 py-2 border border-cyan-400 text-primary rounded hover:bg-cyan-400 hover:text-black transition font-medium"
            >
              Ver código en GitHub →
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}