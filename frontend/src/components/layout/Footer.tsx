export default function Footer() {
  return (
    <footer className="border-t border-gray-300 dark:border-gray-800 mt-24 py-10">
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Diseñado y construido por{" "}
        <span className="text-primary font-medium">
          Borja Olazabal
        </span>
        <span className="block mt-1 text-xs text-gray-500 dark:text-gray-500">
          Programador web · Portfolio profesional
        </span>
        <a
          href="/admin/login"
          aria-label="admin"
          className="block mt-5 text-gray-400 dark:text-gray-700 hover:text-gray-500 dark:hover:text-gray-500 transition-colors text-xs"
          style={{ opacity: 0.25, letterSpacing: '4px' }}
        >
          · · ·
        </a>
      </div>
    </footer>
  );
}