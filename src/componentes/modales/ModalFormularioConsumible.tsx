import React from 'react';
import type { ConsumableItem } from '../../tipos';

interface ModalFormularioConsumibleProps {
  setShowConsumableModal: (show: boolean) => void;
  newConsumable: Partial<ConsumableItem>;
  setNewConsumable: React.Dispatch<React.SetStateAction<any>>;
  handleSaveConsumable: () => void;
  appZoom: number;
}

export const ModalFormularioConsumible: React.FC<ModalFormularioConsumibleProps> = ({
  setShowConsumableModal,
  newConsumable,
  setNewConsumable,
  handleSaveConsumable,
  appZoom
}) => {
  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" 
      style={{ zoom: 1 / appZoom } as React.CSSProperties}
    >
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200">
        <h3 className="font-black text-2xl text-slate-900 mb-6 tracking-tight">Alta de Material</h3>
        
        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1.5">
              Descripción del Insumo
            </label>
            <input 
              className="w-full px-4 py-3 border border-slate-300 bg-slate-50 focus:bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-slate-800 shadow-inner transition-all" 
              placeholder="Ej. Rollo de Cable UTP" 
              value={newConsumable.name || ''} 
              onChange={e => setNewConsumable({ ...newConsumable, name: e.target.value })} 
            />
          </div>
          
          <div className="flex gap-5">
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1.5">
                Stock Inicial
              </label>
              <input 
                className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-mono font-black text-xl text-center shadow-sm" 
                type="number" 
                value={newConsumable.quantity || 0} 
                onChange={e => setNewConsumable({ ...newConsumable, quantity: parseInt(e.target.value) || 0 })} 
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-red-500 block mb-1.5">
                Alerta Crítica
              </label>
              <input 
                className="w-full px-4 py-3 border border-red-200 bg-red-50 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none font-mono font-black text-xl text-center text-red-700 shadow-sm" 
                type="number" 
                value={newConsumable.minStock || 5} 
                onChange={e => setNewConsumable({ ...newConsumable, minStock: parseInt(e.target.value) || 0 })} 
              />
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1.5">
              Unidad Logística
            </label>
            <input 
              className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium shadow-sm" 
              placeholder="Metros, Cajas, Paquetes..." 
              value={newConsumable.unit || 'unidades'} 
              onChange={e => setNewConsumable({ ...newConsumable, unit: e.target.value })} 
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
          <button 
            onClick={() => setShowConsumableModal(false)} 
            className="px-6 py-3 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-100 shadow-sm transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSaveConsumable} 
            disabled={!newConsumable.name} 
            className="px-8 py-3 bg-blue-600 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
};
