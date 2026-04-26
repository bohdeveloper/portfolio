"use client";
import { useState } from "react";

const tabs = [
  {
    id: 1,
    empresa: "Inetum",
    puesto: "Programador web",
    fecha: "Abril 2023 ┉ actualidad",
    link: "https://www.inetum.com/es/servicios/ingenieria-de-software/",
    tareas: [
      <>
        He formado parte de un equipo profesional dentro de{" "}
        <a
          href="https://www.ejie.euskadi.eus/quienes-somos/-/somos-ejie/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:underline"
        >
          EJIE
        </a>{" "}
        en el departamento de  educación, bienestar social, juventud y reto demográfico.
      </>,
      <>
        He trabajado en varias aplicaciones bajo la metodología SCRUM (Jira), Cascada y KanBan.
      </>,
      <>
        He utilizado las siguentes tecnologías:{" "}
        <a href="https://github.com/UDA-EJIE" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">UDA</a>,{" "}
        <a href="https://spring.io/projects/spring-boot" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Spring Boot</a>,{" "}
        <a href="https://www.oracle.com/es/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Oracle</a>...{" "}
      </>,
      <>
        Actualmente me estoy formando en las siguentes tecnologías:{" "}
        <a href="https://es.react.dev/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">React y su entorno</a>,{" "}
        <a href="https://angular.dev/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Angular y su entorno</a>,{" "}
        <a href="https://www.postgresql.org/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">PostgreSQL</a>,{" "}
        <a href="https://www.mongodb.com/es" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">MongoDB</a>...{" "}
      </>
    ]
  },
  {
    id: 2,
    empresa: "Bilbomática",
    puesto: "Programador web",
    fecha: "Noviembre 2021 ┉ Marzo 2023",
    link: "https://www.bilbomatica.es/",
    tareas: [
      <>
        Formé parte de un equipo profesional dentro de{" "}
        <a
          href="https://www.ejie.euskadi.eus/quienes-somos/-/somos-ejie/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:underline"
        >
          EJIE
        </a>{" "}
        en el departamento de turismo.
      </>,
      <>
        Colaboré en el desarrollo de aplicaciones utilizando tecnologías como{" "}
        <a href="https://github.com/UDA-EJIE" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">UDA</a>,{" "}
        <a href="https://www.spri.eus/es/ciberseguridad/hdiv-security-ofrece-herramientas-de-ciberseguridad-para-la-deteccion-proteccion-y-automatizacion-de-procesos/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">HDIV</a>,{" "}
        <a href="https://iberdok.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">IberDok</a>,{" "}
        <a href="https://community.jaspersoft.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">JasperReports</a>, JSP, JSTL, Tiles, Java, Spring, JavaScript, JQuery, CSS, Bootstrap, Oracle SQL Developer y Jackson JSON.
      </>,
      <>
        Gestioné versiones con{" "}
        <a href="https://subversion.apache.org/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">SVN</a>{" "}
        y seguimientos con{" "}
        <a href="https://trello.com/es" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Trello</a>.
      </>,
    ],
  },
  {
    id: 3,
    empresa: "MegatronHQ",
    puesto: "Serv. Técnico / Web",
    fecha: "Diciembre 2020 ┉ Febrero 2021",
    link: "https://www.linkedin.com/company/megatron-hq/",
    tareas: [
      <>
        Encargado del departamento técnico y creación de páginas web con{" "}
        <a href="https://es.wix.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">WIX</a>, optimizando SEO y estrategias de marketing.
      </>,
    ],
  },
  {
    id: 4,
    empresa: "Likale",
    puesto: "Tornero de revestimientos elastoméricos",
    fecha: "Junio 2018 ┉ Diciembre 2019",
    link: "https://likale.com/",
    tareas: [
      <>Manipulé un torno y maquinaria ligera, tambien hice trabajos de almacenero.</>
    ]
  },
  {
    id: 5,
    empresa: "W. Diamant / Winterstone",
    puesto: "Prod. Herramientas de diamante",
    fecha: "Mayo 2016 ┉ Octubre 2018",
    link: "https://winterstone.net/",
    tareas: [
      <>Controlé maquinaria ligera y pesada, produciendo herramientas de diamante.</>
    ]
  },
];

export default function Experiencia() {
  const [active, setActive] = useState(1);

  return (
    <section id="experiencia" className="max-w-6xl mx-auto px-6 py-32 mb-60">
      <h2 className="text-3xl font-bold text-black dark:text-white mb-12 flex items-center gap-3">
        <span className="text-cyan-400 text-4xl">⌁</span>
        Dónde he trabajado
      </h2>

      <div className="flex flex-col md:flex-row gap-12">
        
        {/* TABS */}
        <div className="flex flex-col gap-4 md:w-1/4 w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`text-left px-4 py-2 border-l-4 transition-all ${
                active === tab.id
                  ? "border-cyan-400 text-cyan-400"
                  : "border-gray-400 dark:border-gray-700 hover:border-cyan-400"
              }`}
            >
              {tab.empresa}
            </button>
          ))}
        </div>

        {/* CONTENIDO */}
        <div className="md:w-3/4 space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold">{tabs[active - 1].puesto}</h3>
            <a
              href={tabs[active - 1].link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              ↗
            </a>
          </div>

          <p className="text-gray-600 dark:text-gray-400">
            {tabs[active - 1].fecha}
          </p>

          <ul className="list-disc pl-6 space-y-3 text-gray-700 dark:text-gray-300">
            {tabs[active - 1].tareas.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* BOTÓN CV */}
      <a
        href="/CV-Borja-Olazabal.pdf"
        target="_blank"
        className="inline-block mt-12 px-6 py-3 border border-cyan-400 text-cyan-400 rounded hover:bg-cyan-400 hover:text-black transition"
      >
        Accede a mi CV
      </a>
    </section>
  );
}
