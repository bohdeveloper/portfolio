"use client";
import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { usePathname } from "next/navigation";
import CVDownload from "@/components/ui/CVDownload";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // onHome determina si los links de navegación usan anclas relativas (#section)
  // o rutas absolutas (/#section). Evita que desde páginas internas el hash
  // enlace a un fragmento inexistente en lugar de volver al home primero.
  const onHome = pathname === '/' || pathname === '';

  return (
    <>
      <header className="navbar fixed top-0 left-0 w-full z-50 bg-white/85 dark:bg-[#0d0d0d]/85 backdrop-blur-3xl border-b border-gray-200 dark:border-gray-800">
        <nav className="max-w-full mx-auto flex justify-between items-center py-4 px-6">
          {/* LOGO */}
          <div className="logo flex items-center">
            <Link
              href="/"
              aria-label="Inicio - Portfolio profesional de Borja Olazabal"
              className="flex items-center gap-2"
            >
              <img
                src="../../../images/bohdeveloper-desarrollador-web.png"
                alt="bohdeveloper — Borja Olazabal, desarrollador Java y Spring Boot"
                className="h-14 w-auto logo-filter"
              />
            </Link>
          </div>

          {/* DERECHA: CV + ThemeToggle + Hamburguesa (solo móvil) */}
          <div className="flex items-center gap-3 md:hidden">
            {/* En la barra móvil solo cabe la etiqueta «CV»; el panel se abre
                como modal a pantalla completa. */}
            <CVDownload size="sm" align="right" label="CV" />

            <ThemeToggle />

            <button
              onClick={() => setOpen(!open)}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              className="p-2 rounded border border-gray-400 dark:border-gray-600 hover:border-cyan-400 transition-colors"
            >
              {open ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-black dark:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-black dark:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* MENÚ DESKTOP */}
          <div className="links hidden md:flex items-center gap-8">
            <ul className="flex items-center gap-8 text-lg font-medium">
              <li><a href={onHome ? '#quien-soy' : '/#quien-soy'} className="hover:text-primary transition">Quién soy</a></li>
              <li><a href={onHome ? '#experiencia' : '/#experiencia'} className="hover:text-primary transition">Experiencia</a></li>
              <li><a href={onHome ? '#proyectos' : '/#proyectos'} className="hover:text-primary transition">Proyectos</a></li>
              <li><a href={onHome ? '#aprendizaje' : '/#aprendizaje'} className="hover:text-primary transition">Formación</a></li>
              <li><a href={onHome ? '#ia' : '/#ia'} className="hover:text-primary transition">IA</a></li>
              <li><a href={onHome ? '#juegos' : '/#juegos'} className="hover:text-primary transition">Juega</a></li>
              <li><a href={onHome ? '#contacto' : '/#contacto'} className="hover:text-primary transition">Contacto</a></li>
            </ul>

            <div className="flex items-center gap-4">
              {/* El panel se despliega hacia la izquierda: el botón vive
                  pegado al borde derecho de la ventana. */}
              <CVDownload size="sm" align="right" label="Accede a mi CV" />

              <ThemeToggle />
            </div>
          </div>
        </nav>
      </header>

      {/* MENÚ MÓVIL — renderizado fuera del <header> para evitar que el
          backdrop-filter del navbar corte el z-index del overlay a pantalla completa */}
      {open && (
        <div className="md:hidden fixed inset-0 bg-white dark:bg-[#0d0d0d] z-[60] flex flex-col">
          {/* Cabecera del overlay */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <Link href="/" aria-label="Inicio - Portfolio profesional de Borja Olazabal" onClick={() => setOpen(false)}>
              <img
                src="../../../images/bohdeveloper-desarrollador-web.png"
                alt="bohdeveloper — Borja Olazabal, desarrollador Java y Spring Boot"
                className="h-14 w-auto logo-filter"
              />
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="p-2 rounded border border-gray-400 dark:border-gray-600 hover:border-cyan-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Links del menú móvil: setOpen(false) cierra el overlay al navegar.
              Reutilizan la misma lógica onHome que el menú desktop. */}
          <ul className="flex flex-col flex-1 justify-center px-8 gap-8 text-xl font-medium text-black dark:text-white">
            <li><a onClick={() => setOpen(false)} href={onHome ? '#quien-soy' : '/#quien-soy'} className="block hover:text-primary transition">Quién soy</a></li>
            <li><a onClick={() => setOpen(false)} href={onHome ? '#experiencia' : '/#experiencia'} className="block hover:text-primary transition">Experiencia</a></li>
            <li><a onClick={() => setOpen(false)} href={onHome ? '#proyectos' : '/#proyectos'} className="block hover:text-primary transition">Proyectos</a></li>
            <li><a onClick={() => setOpen(false)} href={onHome ? '#aprendizaje' : '/#aprendizaje'} className="block hover:text-primary transition">Formación</a></li>
            <li><a onClick={() => setOpen(false)} href={onHome ? '#ia' : '/#ia'} className="block hover:text-primary transition">IA</a></li>
            <li><a onClick={() => setOpen(false)} href={onHome ? '#juegos' : '/#juegos'} className="block hover:text-primary transition">Juega</a></li>
            <li><a onClick={() => setOpen(false)} href={onHome ? '#contacto' : '/#contacto'} className="block hover:text-primary transition">Contacto</a></li>
            <li className="pt-4">
              <CVDownload fullWidth label="Accede a mi CV" className="font-bold text-base" />
            </li>
          </ul>
        </div>
      )}
    </>
  );
}