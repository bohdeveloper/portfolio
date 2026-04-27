export default function Aprendizaje() {
  const cursos = [
    {
      titulo: "Curso Java POO & BD relacionales",
      descripcion:
        "Curso intensivo de Java orientado a objetos y bases de datos relacionales.",
      tecnologias: [
        "Java",
        "Spring",
        "JSP / JDBC / Thymeleaf",
        "Lombok / Maven",
        "JavaScript / jQuery",
        "MySQL Workbench",
      ],
      link: "/images/diploma_ipartek.jpg",
    },
    {
      titulo: "Curso de Oracle PL/SQL desde Cero",
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
      titulo: "Universidad Java – Cero a Experto (+155h)",
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
      "Tecnologías aplicadas en proyectos personales como Unyona y Nitflex:",
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
        Formación y aprendizaje continuo
      </h2>

      {/* TEXTO SEO DISCRETO */}
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-3xl mb-12">
        Complemento mi experiencia como <strong>programador web</strong> mediante
        formación especializada, cursos técnicos y aprendizaje autodidacta,
        aplicando estos conocimientos directamente en proyectos reales de
        desarrollo web.
      </p>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {/* CURSOS */}
        {cursos.map((c, i) => (
          <a
            key={i}
            href={c.link}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block border border-cyan-400 rounded-lg p-6 bg-white dark:bg-[#0d0d0d] hover:scale-[1.02] transition-all"
          >
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
            className="relative border border-cyan-400 rounded-lg p-6 bg-white dark:bg-[#0d0d0d] hover:scale-[1.02] transition-all"
          >
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

        {/* FP FUTURA */}
        <div className="border border-gray-400 dark:border-gray-700 rounded-lg p-6 bg-gray-200/60 dark:bg-gray-800/40 opacity-70">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Próximamente: FP Superior en DAW
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Formación Profesional Superior en Desarrollo de Aplicaciones Web.
          </p>

          <p className="text-xs text-gray-500 mt-4 italic">
            *Actualmente pendiente de inicio.
          </p>
        </div>
      </div>
    </section>
  );
}
