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
        "JavaScript / JQuery",
        "MySQL Workbench ...",
      ],
      link: "/images/diploma_ipartek.jpg"
    },
    {
      titulo: "Curso de Oracle PL/SQL desde Cero",
      descripcion:
        "Curso intensivo de Oracle PL/SQL para principiantes.",
      tecnologias: [
        "Bloques",
        "Excepciones",
        "Cursores",
        "Procedimientos Almacenados",
        "Funciones",
        "Paquetes",
        "Triggers ..."
      ],
      link: "/images/diploma_PLSQL_udemy.jpg"
    },
    {
      titulo: "Curso Universidad Java - Cero a Experto - Actualizado (+155 hrs)",
      descripcion:
        "Curso intensivo de Java orientado a objetos y bases de datos relacionales.",
      tecnologias: [
        "Java",
        "Spring",
        "JSP / JDBC / Thymeleaf",
        "Lombok / Maven",
        "Angular",
        "Struts ...",
      ],
      link: "https://www.udemy.com/course/universidad-java-especialista-en-java-desde-cero-a-master/learn/lecture/44881751?start=120#overview",
      estado: "en-curso"
    },
  ];

  const aprendiendo1 = {
    titulo: "Conocimientos en React y NoSQL",
    descripcion:
      "Unyona y Nitflex estan desarrolladas con estas tecnologías:",
    tecnologias: [
      "React",
      "TypeScript",
      "MongoDB",
      "Express",
      "Tailwind ...",
    ]
  };

  const aprendiendo2 = {
    titulo: "Conocimientos en Angular y Spring Boot",
    descripcion:
      "Diamadmin esta desarrollada con estas tecnologías:",
    tecnologias: [
      "Angular",
      "Spring Boot",
      "PostgreSQL",
      "Arquitectura modular ..."
    ]
  };

  return (
    <section id="aprendizaje" className="max-w-6xl mx-auto px-6 py-32">
      <h2 className="text-3xl font-bold text-black dark:text-white mb-12 flex items-center gap-3">
        <span className="text-primary text-4xl">⌁</span>
        Mis conocimientos
      </h2>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {/* TARJETAS DE CURSOS */}
        {cursos.map((c, i) => (
          <a
            key={i}
            href={c.link}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block border border-cyan-400 dark:border-cyan-400 rounded-lg p-6 bg-white dark:bg-[#0d0d0d] hover:border-cyan-400 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <span className="text-primary text-2xl">📘</span>
              
              {c.estado === "en-curso" ? (
                <span className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full border border-cyan-400 text-primary bg-cyan-400/10 dark:bg-cyan-400/20">
                  En curso
                </span>
              ) : (<span className="text-primary text-sm">↗</span>)}
            </div>

            <h3 className="text-lg font-semibold text-black dark:text-white mt-3">
              {c.titulo}
            </h3>

            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {c.descripcion}
            </p>

            <ul className="list-disc pl-5 mt-4 space-y-1 text-gray-700 dark:text-gray-300">
              {c.tecnologias.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          </a>
        ))}

        {/* TARJETA DE CONOCIMIENTOS ACTUALES 1 */}
        <div
          className="block border border-cyan-400 rounded-lg p-6 bg-white dark:bg-[#0d0d0d] hover:scale-[1.02] transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="text-primary text-2xl">⚡</span>
          </div>

          <h3 className="text-lg font-semibold text-black dark:text-white mt-3">
            {aprendiendo1.titulo}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {aprendiendo1.descripcion}
          </p>

          <ul className="list-disc pl-5 mt-4 space-y-1 text-gray-700 dark:text-gray-300">
            {aprendiendo1.tecnologias.map((t, idx) => (
              <li key={idx}>{t}</li>
            ))}
          </ul>
        </div>

        {/* TARJETA DE CONOCIMIENTOS ACTUALES 2 */}
        <div
          className="block border border-cyan-400 rounded-lg p-6 bg-white dark:bg-[#0d0d0d] hover:scale-[1.02] transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="text-primary text-2xl">⚡</span>
          </div>

          <h3 className="text-lg font-semibold text-black dark:text-white mt-3">
            {aprendiendo2.titulo}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {aprendiendo2.descripcion}
          </p>

          <ul className="list-disc pl-5 mt-4 space-y-1 text-gray-700 dark:text-gray-300">
            {aprendiendo2.tecnologias.map((t, idx) => (
              <li key={idx}>{t}</li>
            ))}
          </ul>
        </div>

        {/* TARJETA OPACA: FUTURA FP */}
        <div className="border border-gray-400 dark:border-gray-700 rounded-lg p-6 bg-gray-200/60 dark:bg-gray-800/40 opacity-70 backdrop-blur-sm cursor-not-allowed">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Próximamente: FP Superior en DAW
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mt-2">
            En breves comenzaré la Formación Profesional Superior en Desarrollo
            de Aplicaciones Web.
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4 italic">
            *Esta tarjeta está desactivada porque el curso aún no ha comenzado.
          </p>
        </div>
      </div>
    </section>
  );
}
