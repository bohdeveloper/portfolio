"use client";

import { useEffect, useRef, useState } from "react";

/* ============================
   CV — SELECTOR DE VERSIÓN

   Dos CV con el mismo contenido base pero distinto enfoque. Se etiquetan
   por el stack que busca quien descarga, no por la taxonomía interna
   («sector público» / «producto»), que fuera de contexto no dice nada.

   El desplegable es la variante de escritorio; en móvil el mismo panel se
   presenta como modal a pantalla completa, donde un dropdown flotante
   resulta incómodo de acertar con el dedo.
============================ */

export const CV_BACKEND = "/cv/borja-olazabal-backend-sector-publico.pdf";
export const CV_FULLSTACK = "/cv/borja-olazabal-fullstack-producto.pdf";

const OPCIONES = [
  {
    href: CV_BACKEND,
    titulo: "Backend & Sector público",
    stack: "Java · Spring Boot · Oracle · JSP",
    descarga: "borja-olazabal-backend-sector-publico.pdf",
  },
  {
    href: CV_FULLSTACK,
    titulo: "Fullstack & Producto",
    stack: "React · Next.js · Node · Docker",
    descarga: "borja-olazabal-fullstack-producto.pdf",
  },
];

interface Props {
  /** primary: relleno cian de CTA. outline: borde cian sobre fondo neutro. */
  variant?: "primary" | "outline";
  className?: string;
}

export default function CVDownload({ variant = "outline", className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  /* Cierre por clic fuera y por Escape. El listener se registra solo
     mientras el panel está abierto para no dejar handlers colgando. */
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /* Al abrir, el foco entra en la primera opción: el usuario de teclado
     no tiene que tabular a ciegas por el resto de la página. */
  useEffect(() => {
    if (open) itemsRef.current[0]?.focus();
  }, [open]);

  /* Navegación con flechas dentro del menú (patrón WAI-ARIA menu). */
  function onItemKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const delta = e.key === "ArrowDown" ? 1 : -1;
      const next = (index + delta + OPCIONES.length) % OPCIONES.length;
      itemsRef.current[next]?.focus();
    }
    if (e.key === "Tab") setOpen(false);
  }

  const triggerCls =
    variant === "primary"
      ? "border border-cyan-400 bg-cyan-400/10 text-primary hover:bg-cyan-400 hover:text-black"
      : "border border-cyan-400 text-primary hover:bg-cyan-400 hover:text-black";

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Descargar currículum de Borja Olazabal"
        className={`inline-flex items-center gap-2 px-6 py-3 rounded transition ${triggerCls}`}
      >
        Descargar CV
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          {/* Fondo del modal — solo móvil */}
          <div
            className="sm:hidden fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />

          <div
            role="menu"
            aria-label="Versiones del currículum"
            className="
              z-[71]
              fixed inset-x-4 bottom-4 top-auto
              sm:absolute sm:inset-auto sm:top-full sm:left-0 sm:mt-2 sm:w-[22rem]
              rounded-lg border border-cyan-400/60 bg-white dark:bg-[#0d0d0d]
              shadow-xl shadow-black/20 overflow-hidden
            "
          >
            <p className="px-4 pt-4 pb-2 text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Elige la versión
            </p>

            {OPCIONES.map((op, i) => (
              <a
                key={op.href}
                ref={(el) => { itemsRef.current[i] = el; }}
                href={op.href}
                download={op.descarga}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onKeyDown={(e) => onItemKeyDown(e, i)}
                onClick={() => setOpen(false)}
                className="
                  block px-4 py-3.5 border-t border-gray-200 dark:border-gray-800
                  hover:bg-cyan-400/10 focus:bg-cyan-400/10 focus:outline-none
                  focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-cyan-400
                  transition-colors
                "
              >
                <span className="block text-sm font-semibold text-black dark:text-white">
                  {op.titulo}
                </span>
                <span className="block mt-0.5 text-xs text-primary font-mono">
                  {op.stack}
                </span>
              </a>
            ))}

            {/* Cierre explícito en móvil: el clic fuera existe, pero en un
                modal a pantalla completa conviene un control visible. */}
            <button
              type="button"
              onClick={() => { setOpen(false); btnRef.current?.focus(); }}
              className="sm:hidden w-full px-4 py-3 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400"
            >
              Cancelar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
