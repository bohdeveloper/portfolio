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
        {/* Blog archivado: sin entrada en el menú, pero sus URLs siguen vivas
            porque los artículos están indexados. */}
        <a href="/blog" className="inline-block mt-3 text-xs text-gray-500 dark:text-gray-500 hover:text-primary hover:underline">
          Blog (archivo)
        </a>
      </div>
    </footer>
  );
}