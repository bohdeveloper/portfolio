"use client";
import { useFadeInOnScroll } from "@/hooks/useFadeInOnScroll";

export default function QuienSoy() {
  const { ref, visible } = useFadeInOnScroll();
  return (
    <section
      id="quien-soy"
      className="max-w-6xl mx-auto px-6 py-28 flex flex-col md:flex-row items-center gap-2 md:gap-12"
    >

      {/* IMAGEN */}
      <div className="flex-1 flex justify-center md:justify-end">
        <img
          src="../../../images/Borja-Olazabal.png"
          alt="Borja Olazabal"
          ref={ref}
          className={`w-5/2 sm:w-3/4 md:w-full max-w-sm sm:max-w-md md:max-w-none opacity-0 ${visible ? "fade-in-up" : "opacity-0"}`}
        />
      </div>

      {/* TEXTO */}
      <div className="flex-1 space-y-6 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
        <h2 className="text-3xl font-bold text-black dark:text-white flex items-center gap-3">
          <span className="text-primary text-4xl">⌁</span>
          Acerca de mí
        </h2>

        <p>
          Me llamo <strong>Borja Olazabal</strong> y me encanta dar vida útil a
          espacios en la red. También me fascina el poder manejar datos o
          información mediante una interfaz sencilla y versátil.
        </p>

        <p>
          En el 2019 fue cuando me interesé por el{" "}
          <strong>desarrollo web</strong>, empezando un curso básico de
          publicación web. Desde entonces{" "}
          <u>estoy convencido de que vivo por y para mi vocación</u>.
        </p>

        <p>
          He tenido la suerte de tener grandes mentores, grandes compañeros y
          grandes experiencias que han ido afianzando mis conocimientos en esta
          extensa área. Mi verdadero reto se presentó cuando tuve el privilegio
          de{" "}
          <a
            href="https://www.inetum.com/es/servicios/ingenieria-de-software/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            formar parte de un equipo profesional dentro de una consultoría e
            ingeniería de software.
          </a>
        </p>

        <p>
          Actualmente, estoy enfocado en aprender nuevas tecnologías en respuesta
          a la demanda de empleo actual. Además, me gusta crear y probar{" "}
          <a href="#proyectos" className="text-primary hover:underline">
            mis propios proyectos
          </a>
          .
        </p>

        
<p>
  En <strong>bohdeveloper.com</strong> comparto mi <strong>portfolio profesional</strong>,
  mis <strong>proyectos de desarrollo web</strong> y mi evolución como
  programador.
</p>


        <p className="font-semibold">Estas son las tecnologías que más he utilizado:</p>

        {/* LISTA DE TECNOLOGÍAS */}
        <ul className="grid grid-cols-2 gap-2 text-primary text-xs sm:text-sm md:text-base font-medium">
          <li>HTML / JSP / JSTL</li>
          <li>CSS / Bootstrap</li>
          <li>JavaScript / jQuery</li>
          <li>React</li>
          <li>Angular</li>
          <li>Java / Spring Boot</li>
          <li>UDA (Ejie)</li>
          <li>Oracle SQL</li>
          <li>PLSQL</li>
          <li>PostgreSQL</li>
          <li>MongoDB</li>
          <li>Git</li>
          <li>Eclipse</li>
          <li>VSC</li>
        </ul>        
      </div>
      
    </section>
  );
}
