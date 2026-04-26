export default function Proyectos() {
  return (
    <section id="proyectos" className="py-20">
      <h2 className="text-3xl font-bold mb-10">Proyectos</h2>

      <ul className="grid md:grid-cols-2 gap-10">

        <li className="border rounded p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
          <h3 className="text-xl font-semibold">Diamadmin</h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Aplicación para gestionar suministros, productos, proveedores y clientes en una empresa de control alimentario.
          </p>
          <p className="text-sm text-gray-500 mt-2">Java · Spring · JSP/JSTL · Bootstrap · jQuery</p>
        </li>

        <li className="border rounded p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
          <h3 className="text-xl font-semibold">PizzaSaturn</h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Aplicación para una tienda de comida rápida imaginaria.
          </p>
          <p className="text-sm text-gray-500 mt-2">Java · Spring · JSP/JSTL · Bootstrap · jQuery</p>
        </li>

      </ul>
    </section>
  );
}
