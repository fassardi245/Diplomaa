import { createVehicle } from "@/actions/createVehicle";
import Link from "next/link";

export default function NuevoVehiculoPage() {
  return (
    <div className="p-10 max-w-4xl mx-auto">
      {/* Encabezado con botón de volver */}
      <div className="flex items-center mb-8">
        <Link href="/admin/flota" className="text-gray-500 hover:text-gray-800 mr-4 transition">
          ← Volver
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Registrar Nuevo Vehículo</h1>
      </div>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 p-8">
        
        {/* El action llama a nuestra función del servidor */}
        <form action={createVehicle} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo: Modelo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Modelo y Marca</label>
              <input 
                name="model" 
                type="text" 
                required 
                placeholder="Ej: Ford Transit 2023"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>

            {/* Campo: Patente */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Patente / Placa</label>
              <input 
                name="plate" 
                type="text" 
                required 
                placeholder="Ej: AA 123 BB"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition font-mono uppercase"
              />
              <p className="text-xs text-gray-400 mt-1">El slug se generará automáticamente de la patente.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo: Combustible */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nivel de Combustible (%)</label>
              <div className="relative">
                <input 
                  name="fuelLevel" 
                  type="number" 
                  min="0" 
                  max="100" 
                  defaultValue="100"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
                <span className="absolute right-4 top-3 text-gray-400">%</span>
              </div>
            </div>

            {/* Campo: Estado (Select) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Estado Inicial</label>
              <select 
                name="status" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white"
              >
                <option value="available">🟢 Disponible</option>
                <option value="in_transit">🚚 En Ruta</option>
                <option value="maintenance">🔧 En Mantenimiento</option>
              </select>
            </div>
          </div>

          {/* Separador */}
          <hr className="border-gray-100 my-6" />

          {/* Botón de Guardar */}
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 active:scale-95 transition shadow-lg shadow-blue-200"
            >
              Guardar Vehículo
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}