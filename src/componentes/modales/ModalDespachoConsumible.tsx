import React from 'react';
import { Package } from 'lucide-react';
import type { ConsumableItem, Engineer } from '../../tipos';

interface ModalDespachoConsumibleProps {
  setShowDispatchModal: (show: boolean) => void;
  selectedConsumable: ConsumableItem;
  dispatchData: { engineerId: string; quantity: number };
  setDispatchData: React.Dispatch<React.SetStateAction<any>>;
  engineers: Engineer[];
  handleDispatchConsumable: () => void;
  appZoom: number;
}

export const ModalDespachoConsumible: React.FC<ModalDespachoConsumibleProps> = ({
  setShowDispatchModal,
  selectedConsumable,
  dispatchData,
  setDispatchData,
  engineers,
  handleDispatchConsumable,
  appZoom
}) => {
  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" 
      style={{ zoom: 1 / appZoom } as React.CSSProperties}
    >
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-sm">
            <Package size={28}/>
          </div>
          <h3 className="font-black text-2xl text-slate-900 leading-tight tracking-tight">Despachar Insumo</h3>
          <p className="text-blue-600 font-bold mt-1 text-sm">{selectedConsumable.name}</p>
        </div>
        
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6 flex justify-between items-center shadow-inner">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Disponibilidad:</span>
          <span className="text-3xl font-black dm-text tracking-tight">
            {selectedConsumable.quantity} <span className="text-sm text-slate-500 font-semibold">{selectedConsumable.unit}</span>
          </span>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Entregar a personal
            </label>
            <select 
              className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm text-slate-800" 
              value={dispatchData.engineerId} 
              onChange={e => setDispatchData({ ...dispatchData, engineerId: e.target.value })}
            >
              <option value="" disabled>Seleccione...</option>
              {engineers.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Unidades a descontar
            </label>
            <input 
              type="number" 
              min="1" 
              max={selectedConsumable.quantity} 
              className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-mono font-black text-2xl text-center shadow-sm text-blue-700" 
              value={dispatchData.quantity} 
              onChange={e => setDispatchData({ ...dispatchData, quantity: parseInt(e.target.value) || 1 })} 
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-8">
          <button 
            onClick={() => setShowDispatchModal(false)} 
            className="flex-1 py-3.5 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-100 shadow-sm transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleDispatchConsumable} 
            disabled={!dispatchData.engineerId || dispatchData.quantity > selectedConsumable.quantity || dispatchData.quantity <= 0} 
            className="flex-1 py-3.5 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 disabled:opacity-50 transition-all"
          >
            Procesar
          </button>
        </div>
      </div>
    </div>
  );
};
