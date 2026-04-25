export default function Home() {
  return (
    <div className="p-10 bg-gray-100 min-h-screen space-y-6">
      <h1 className="text-5xl font-bold text-blue-600">Mi portafolio</h1>

      <p className="text-lg text-gray-700">
        Este es un portafolio simple construido con Next.js.
      </p>

      <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-gray-800">
        Botón de prueba
      </button>

      <div className="text-red-700 text-3xl">
        Tailwind está funcionando
      </div>
    </div>
  );
}
