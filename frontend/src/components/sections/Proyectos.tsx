export default function Proyectos() {
  const proyectos = [
    {
      nombre: "NITFLEX",
      descripcion: "Aplicación de streaming educativa inspirada en Netflix.",
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
      nombre: "UNYONA",
      descripcion: "Plataforma social para eventos y gestión de comunidades.",
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
      nombre: "DIAMADMIN",
      descripcion:
        "Aplicación de gestión administrativa modular altamente configurable.",
      arquitectura: "Arquitectura modular",
      tecnologias: ["Angular", "Spring Boot", "PostgreSQL"],
      github: "https://github.com/bohdeveloper/diamadmin",
    },
    {
      nombre: "DEVHELPER",
      descripcion: "Herramienta de desarrollo web full stack.",
      arquitectura: "Monorepo",
      tecnologias: [
        "JSP",
        "HTML",
        "CSS",
        "Bootstrap",
        "JavaScript",
        "JQuery",
        "AJAX",
        "Spring Boot MVC",
        "SQLite",
      ],
      github: "https://github.com/bohdeveloper/devhelper",
    },
  ];

  return (
    <section id="proyectos" className="max-w-6xl mx-auto px-6 py-32">
      <h2 className="text-3xl font-bold text-black dark:text-white mb-12 flex items-center gap-3">
        <span className="text-cyan-400 text-4xl">⌁</span>
        Mis proyectos
      </h2>

      <div className="grid gap-10 md:grid-cols-2">
        {proyectos.map((p, i) => (
          <a
            key={i}
            href={p.github}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block border border-gray-300 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-[#0d0d0d] hover:border-cyan-400 hover:scale-[1.02] transition-all cursor-pointer"
          >
            {/* ETIQUETA “EN DESARROLLO” */}
            <span className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full border border-cyan-400 text-cyan-400 bg-cyan-400/10 dark:bg-cyan-400/20">
              En desarrollo
            </span>

            <h3 className="text-xl font-semibold text-black dark:text-white">
              {p.nombre}
            </h3>

            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {p.descripcion}
            </p>

            <p className="text-sm text-cyan-400 mt-2 font-medium">
              {p.arquitectura}
            </p>

            <div className="mt-4">
              <h4 className="text-sm font-semibold text-black dark:text-white mb-2">
                Tecnologías:
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                {p.tecnologias.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
