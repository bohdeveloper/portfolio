"use client";

export default function SocialPanel() {
  return (
    <>
      {/* DESKTOP */}
      <div className="fixed bottom-6 left-6 hidden md:block">
        <ul className="flex flex-col gap-4">

          {/* Scroll arriba */}
          <li>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="group text-gray-700 dark:text-white transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 group-hover:text-teal-400 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 19V5m0 0l-6 6m6-6l6 6"
                />
              </svg>
            </button>
          </li>

          {/* Instagram */}
          <li>
            <a
              href="https://www.instagram.com/bohdeveloper/"
              target="_blank"
              rel="noreferrer"
              className="group text-gray-700 dark:text-white transition p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 group-hover:text-teal-400 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17" cy="7" r="1.2" />
              </svg>
            </a>
          </li>

          {/* LinkedIn */}
          <li>
            <a
              href="https://www.linkedin.com/in/bolazaba"
              target="_blank"
              rel="noreferrer"
              className="group text-gray-700 dark:text-white transition p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 group-hover:text-teal-400 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M4 4h4v16H4z" />
                <circle cx="6" cy="6" r="2" />
                <path d="M10 10h4v10h-4zM14 10h4v10h-4z" />
              </svg>
            </a>
          </li>

          {/* GitHub */}
          <li>
            <a
              href="https://github.com/bohdeveloper"
              target="_blank"
              rel="noreferrer"
              className="group text-gray-700 dark:text-white transition p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 group-hover:text-teal-400 transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2C6.48 2 2 6.58 2 12.2c0 4.5 2.87 8.31 6.84 9.67.5.1.68-.22.68-.48v-1.7c-2.78.62-3.37-1.37-3.37-1.37-.46-1.2-1.12-1.52-1.12-1.52-.92-.65.07-.64.07-.64 1.02.07 1.56 1.07 1.56 1.07.9 1.58 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.38-2.03 1.02-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0112 6.8c.85 0 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.02 1.63 1.02 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9v2.82c0 .26.18.58.69.48A10.2 10.2 0 0022 12.2C22 6.58 17.52 2 12 2z"
                />
              </svg>
            </a>
          </li>
        </ul>
      </div>

      {/* MOBILE */}
      <div className="fixed bottom-2 left-1/4 -translate-x-1/2 flex md:hidden gap-6 bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 py-3 rounded-full shadow-lg border border-gray-300 dark:border-gray-700 z-50">
        {/* Scroll arriba */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-gray-700 dark:text-white transition"
          aria-label="Scroll arriba"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-6 6m6-6l6 6" />
          </svg>
        </button>

        {/* Instagram */}
        <a
          href="https://www.instagram.com/bohdeveloper/"
          target="_blank"
          rel="noreferrer"
          className="text-gray-700 dark:text-white transition"
          aria-label="Instagram"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17" cy="7" r="1.2" />
          </svg>
        </a>

        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/in/bolazaba"
          target="_blank"
          rel="noreferrer"
          className="text-gray-700 dark:text-white transition"
          aria-label="LinkedIn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M4 4h4v16H4z" />
            <circle cx="6" cy="6" r="2" />
            <path d="M10 10h4v10h-4zM14 10h4v10h-4z" />
          </svg>
        </a>

        {/* GitHub */}
        <a
          href="https://github.com/bohdeveloper"
          target="_blank"
          rel="noreferrer"
          className="text-gray-700 dark:text-white transition"
          aria-label="GitHub"
        >
         <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-6 h-6 fill-current"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 .5C5.73.5.5 5.86.5 12.44c0 5.26 3.44 9.72 8.2 11.3.6.11.82-.27.82-.59v-2.2c-3.34.75-4.04-1.7-4.04-1.7-.55-1.45-1.35-1.84-1.35-1.84-1.1-.78.08-.76.08-.76 1.22.09 1.86 1.3 1.86 1.3 1.08 1.91 2.83 1.36 3.52 1.04.11-.8.42-1.36.76-1.67-2.66-.31-5.47-1.38-5.47-6.14 0-1.36.46-2.47 1.22-3.34-.12-.31-.53-1.56.11-3.25 0 0 .99-.33 3.24 1.27a11.2 11.2 0 015.9 0c2.24-1.6 3.24-1.27 3.24-1.27.64 1.69.23 2.94.11 3.25.76.87 1.22 1.98 1.22 3.34 0 4.78-2.82 5.82-5.5 6.13.43.39.82 1.15.82 2.32v3.44c0 .33.21.71.83.59 4.76-1.58 8.2-6.04 8.2-11.3C23.5 5.86 18.27.5 12 .5z"
            />
          </svg>  
        </a>
      </div>
    </>
  );
}
