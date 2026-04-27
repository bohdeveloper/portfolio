export default function EmailPanel() {
  return (
    <>
      {/* DESKTOP */}
      <div className="fixed bottom-6 right-6 hidden md:flex flex-col items-center">
        <div className="w-px h-20 bg-gray-400 dark:bg-gray-600 mb-4"></div>

        <a
          href="mailto:ohb_1@outlook.com"
          className="text-gray-700 dark:text-white hover:text-teal-400 dark:hover:text-teal-400 transition p-2 border-b border-gray-400 dark:border-white hover:border-cyan-400 dark:hover:border-cyan-400"
        >
          ohb_1@outlook.com
        </a>
      </div>

      {/* MOBILE */}
      <div className="fixed bottom-2 right-2 md:hidden bg-white/80 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-full shadow-lg border border-gray-300 dark:border-gray-700">
        <a
          href="mailto:ohb_1@outlook.com"
          className="text-sm p-2 text-gray-700 dark:text-white transition"
        >
          ohb_1@outlook.com
        </a>
      </div>
    </>
  );
}
