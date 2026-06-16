import React from 'react';
import { X, UserPlus } from 'lucide-react';
import type { Engineer } from '../../tipos';

interface ModalFormularioIngenieroProps {
  setShowEngineerModal: (show: boolean) => void;
  newEngineer: { name: string; department: string };
  setNewEngineer: React.Dispatch<React.SetStateAction<{ name: string; department: string }>>;
  handleCreateEngineer: () => void;
  appZoom: number;
}

export const ModalFormularioIngeniero: React.FC<ModalFormularioIngenieroProps> = ({
  setShowEngineerModal,
  newEngineer,
  setNewEngineer,
  handleCreateEngineer,
  appZoom
}) => {
  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" 
      style={{ zoom: 1 / appZoom } as React.CSSProperties}
    >
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <UserPlus size={24} className="text-blue-600"/> Nuevo Técnico
          </h3>
          <button 
            onClick={() => setShowEngineerModal(false)} 
            className="text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X size={16}/>
          </button>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1.5">
              Nombre Completo *
            </label>
            <input 
              className="w-full px-4 py-3 border border-slate-300 bg-slate-50 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-slate-800 shadow-inner transition-all text-sm" 
              placeholder="Ej. Ing. Juan Pérez" 
              value={newEngineer.name} 
              onChange={e => setNewEngineer({ ...newEngineer, name: e.target.value })} 
            />
          </div>
          
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1.5">
              Departamento / Área *
            </label>
            <select
              className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-semibold shadow-sm text-slate-800"
              value={newEngineer.department}
              onChange={e => setNewEngineer({ ...newEngineer, department: e.target.value })}
            >
              <option value="" disabled>Seleccione...</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Operaciones">Operaciones</option>
              <option value="Instrumentación">Instrumentación</option>
              <option value="Telecomunicaciones">Telecomunicaciones</option>
              <option value="Seguridad y Control">Seguridad y Control</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
          <button 
            onClick={() => setShowEngineerModal(false)} 
            className="px-6 py-3 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-100 shadow-sm transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleCreateEngineer} 
            disabled={!newEngineer.name.trim() || !newEngineer.department} 
            className="px-8 py-3 bg-blue-600 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
};
