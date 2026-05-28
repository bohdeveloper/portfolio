"use client";
import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
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
                alt="Borja Olazabal, programador web"
                className="h-14 w-auto logo-filter"
              />
            </Link>
          </div>

          {/* DERECHA: CV + ThemeToggle + Hamburguesa (solo móvil) */}
          <div className="flex items-center gap-3 md:hidden">
            <a
              href="../../../borja-olazabal-programador-web-cv.pdf"
              target="_blank"
              aria-label="Currículum de Borja Olazabal, programador web"
              className="px-3 py-1 text-sm border border-cyan-400 text-primary rounded hover:bg-cyan-400 hover:text-black transition"
            >
              CV
            </a>

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
              <li><a href={onHome ? '#ia' : '/#ia'} className="hover:text-primary transition">IA</a></li>
              <li><a href={onHome ? '#aprendizaje' : '/#aprendizaje'} className="hover:text-primary transition">Aprendizaje</a></li>
              <li><a href={onHome ? '#juegos' : '/#juegos'} className="hover:text-primary transition">Juega</a></li>
              <li><a href={onHome ? '#contacto' : '/#contacto'} className="hover:text-primary transition">Contacto</a></li>
            </ul>

            <div className="flex items-center gap-4">
              <a
                href="../../../borja-olazabal-programador-web-cv.pdf"
                target="_blank"
                aria-label="Currículum de Borja Olazabal, programador web"
                className="px-4 py-2 border border-cyan-400 text-primary rounded hover:bg-cyan-400 hover:text-black transition"
              >
                Accede a mi CV
              </a>

              <ThemeToggle />
            </div>
          </div>
        </nav>
      </header>

      {/* MENÚ MÓVIL — fuera del header para evitar que backdrop-blur rompa el fixed */}
      {open && (
        <div className="md:hidden fixed inset-0 bg-white dark:bg-[#0d0d0d] z-[60] flex flex-col">
          {/* Cabecera del overlay */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <Link href="/" aria-label="Inicio - Portfolio profesional de Borja Olazabal" onClick={() => setOpen(false)}>
              <img
                src="../../../images/bohdeveloper-desarrollador-web.png"
                alt="Borja Olazabal, programador web"
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

          {/* Links centrados verticalmente */}
          <ul className="flex flex-col flex-1 justify-center px-8 gap-8 text-xl font-medium text-black dark:text-white">
            <li><a onClick={() => setOpen(false)} href={onHome ? '#quien-soy' : '/#quien-soy'} className="block hover:text-primary transition">Quién soy</a></li>
            <li><a onClick={() => setOpen(false)} href={onHome ? '#experiencia' : '/#experiencia'} className="block hover:text-primary transition">Experiencia</a></li>
            <li><a onClick={() => setOpen(false)} href={onHome ? '#proyectos' : '/#proyectos'} className="block hover:text-primary transition">Proyectos</a></li>
            <li><a onClick={() => setOpen(false)} href={onHome ? '#ia' : '/#ia'} className="block hover:text-primary transition font-semibold">IA</a></li>
            <li><a onClick={() => setOpen(false)} href={onHome ? '#aprendizaje' : '/#aprendizaje'} className="block hover:text-primary transition">Aprendizaje</a></li>
            <li><a onClick={() => setOpen(false)} href={onHome ? '#juegos' : '/#juegos'} className="block hover:text-primary transition">Juega</a></li>
            <li><a onClick={() => setOpen(false)} href={onHome ? '#contacto' : '/#contacto'} className="block hover:text-primary transition">Contacto</a></li>
            <li className="pt-4">
              <a
                href="../../../borja-olazabal-programador-web-cv.pdf"
                target="_blank"
                onClick={() => setOpen(false)}
                className="block text-center px-6 py-4 border border-cyan-400 text-primary rounded hover:bg-cyan-400 hover:text-black transition font-bold text-base"
              >
                Accede a mi CV
              </a>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}