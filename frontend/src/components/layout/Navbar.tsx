"use client";
import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar fixed top-0 left-0 w-full z-50 bg-white/70 dark:bg-[#0d0d0d]/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-full mx-auto flex justify-between items-center py-4 px-6">

        {/* LOGO */}
        <div className="logo flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="../../../images/bohdeveloper-desarrollador-web.png"
              alt="logo"
              className="h-14 w-auto"
            />
          </Link>
        </div>

        {/* DERECHA: CV + ThemeToggle + Hamburguesa (solo móvil) */}
        <div className="flex items-center gap-3 md:hidden">

          {/* CV pequeño */}
          <a
            href="../../../CV_Borja_Olazabal.pdf"
            target="_blank"
            className="px-3 py-1 text-sm border border-cyan-400 text-cyan-400 rounded hover:bg-cyan-400 hover:text-black transition"
          >
            CV
          </a>

          {/* ThemeToggle */}
          <ThemeToggle />

          {/* Hamburguesa */}
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded border border-gray-400 dark:border-gray-600 hover:border-cyan-400 transition-colors"
          >
            {open ? (
              // ICONO CERRAR
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-black dark:text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // ICONO HAMBURGUESA
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-black dark:text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* MENÚ DESKTOP */}
        <div className="links hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-8 text-lg font-medium">
            <li><a href="#quien-soy" className="hover:text-cyan-400 transition">Quién soy</a></li>
            <li><a href="#experiencia" className="hover:text-cyan-400 transition">Experiencia</a></li>
            <li><a href="#proyectos" className="hover:text-cyan-400 transition">Proyectos</a></li>
            <li><a href="#aprendizaje" className="hover:text-cyan-400 transition">Aprendizaje</a></li>
            <li><a href="#contacto" className="hover:text-cyan-400 transition">Contacto</a></li>
          </ul>

          <div className="flex items-center gap-4">
            <a
              href="../../../CV_Borja_Olazabal.pdf"
              target="_blank"
              className="px-4 py-2 border border-cyan-400 text-cyan-400 rounded hover:bg-cyan-400 hover:text-black transition"
            >
              Accede a mi CV
            </a>

            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* MENÚ MÓVIL */}
      {open && (
        <div className="md:hidden bg-white dark:bg-[#0d0d0d] border-t border-gray-300 dark:border-gray-800">
          <ul className="flex flex-col px-6 py-4 gap-4 text-lg font-medium text-black dark:text-white">
            <li><a onClick={() => setOpen(false)} href="#quien-soy" className="hover:text-cyan-400 transition">Quién soy</a></li>
            <li><a onClick={() => setOpen(false)} href="#experiencia" className="hover:text-cyan-400 transition">Experiencia</a></li>
            <li><a onClick={() => setOpen(false)} href="#proyectos" className="hover:text-cyan-400 transition">Proyectos</a></li>
            <li><a onClick={() => setOpen(false)} href="#aprendizaje" className="hover:text-cyan-400 transition">Aprendizaje</a></li>
            <li><a onClick={() => setOpen(false)} href="#contacto" className="hover:text-cyan-400 transition">Contacto</a></li>
          </ul>
        </div>
      )}
    </header>
  );
}
