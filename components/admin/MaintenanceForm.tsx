"use client";

import { createMaintenance } from "@/actions/createMaintenance";
import { updateMaintenance } from "@/actions/updateMaintenance";
import { Save, Wrench, Calendar, DollarSign, FileText, CheckCircle2 } from "lucide-react";

interface VehicleOption {
  _id: string;
  model: string;
  plate: string;
}

interface MaintenanceData {
  _id: string;
  vehicle: { _ref: string };
  type: string;
  description: string;
  cost: number;
  date: string;
  status: string;
}

interface MaintenanceFormProps {
  vehicles: VehicleOption[];
  maintenance?: MaintenanceData;
}

export default function MaintenanceForm({ vehicles, maintenance }: MaintenanceFormProps) {
  const isEditing = !!maintenance;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
      <form action={isEditing ? updateMaintenance : createMaintenance} className="space-y-6">
        
        {isEditing && <input type="hidden" name="id" value={maintenance._id} />}
        
        {/* Si editamos, el vehículo suele ser fijo, pero enviamos el ID igual */}
        <div className={isEditing ? "opacity-70 pointer-events-none" : ""}>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vehículo</label>
          <select 
            name="vehicleId" 
            required 
            defaultValue={maintenance?.vehicle?._ref}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black bg-white"
          >
            <option value="">-- Selecciona una unidad --</option>
            {vehicles.map(v => (
              <option key={v._id} value={v._id}>
                {v.model} - {v.plate}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ESTADO DEL MANTENIMIENTO (Solo visible al editar) */}
          {isEditing && (
             <div className="col-span-full bg-gray-50 p-4 rounded-lg border border-gray-200 mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Estado del Servicio</label>
                <div className="flex gap-4">
                   <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" value="in_progress" defaultChecked={maintenance.status === 'in_progress'} className="text-black focus:ring-black" />
                      <span className="text-sm font-medium text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded">En Proceso</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" value="completed" defaultChecked={maintenance.status === 'completed'} className="text-black focus:ring-black" />
                      <span className="text-sm font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded">Finalizado (Libera Vehículo)</span>
                   </label>
                </div>
             </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Servicio</label>
            <div className="relative">
              <Wrench className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <select name="type" defaultValue={maintenance?.type} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black bg-white">
                <option value="Preventivo">Preventivo (Service)</option>
                <option value="Correctivo">Correctivo (Reparación)</option>
                <option value="Estetico">Limpieza / Estética</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha de Ingreso</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input type="date" name="date" required defaultValue={maintenance?.date} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black text-gray-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Costo Estimado ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input type="number" name="cost" defaultValue={maintenance?.cost} placeholder="0.00" className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Detalle del Trabajo</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            <textarea name="description" rows={3} defaultValue={maintenance?.description} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black"></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button type="submit" className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition shadow-lg">
            <Save className="w-4 h-4" />
            {isEditing ? "Actualizar Servicio" : "Registrar Mantenimiento"}
          </button>
        </div>

      </form>
    </div>
  );
}