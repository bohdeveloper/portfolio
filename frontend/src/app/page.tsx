import Hero from "@/components/sections/Hero";
import QuienSoy from "@/components/sections/QuienSoy";
import Experiencia from "@/components/sections/Experiencia";
import Proyectos from "@/components/sections/Proyectos";
import ClaudeIA from "@/components/sections/ClaudeIA";
import Aprendizaje from "@/components/sections/Aprendizaje";
import Contacto from "@/components/sections/Contacto";

export default function Home() {
  return (
    <>
      <Hero />
      <QuienSoy />
      {/* Formación antes que experiencia: cuenta el recorrido en orden
          (oficio → reconversión → desarrollo) y la hoja de ruta enlaza
          después con los proyectos donde se practica. */}
      <Aprendizaje />
      <Experiencia />
      <Proyectos />
      {/* La IA va después de proyectos y formación: es la prueba de uso
          real que respalda la dirección del hero, no el titular. */}
      <ClaudeIA />
      <Contacto />
    </>
  );
}
