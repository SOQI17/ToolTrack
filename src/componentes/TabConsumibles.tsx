import React from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import type { ConsumableItem, ConsumableLog } from '../tipos';

interface TabConsumiblesProps {
  consumables: ConsumableItem[];
  consumableLogs: ConsumableLog[];
  isAdmin: boolean;
  handleDeleteConsumable: (id: string) => void;
  openDispatchModal: (item: ConsumableItem) => void;
  setShowConsumableModal: (show: boolean) => void;
}

export const TabConsumibles: React.FC<TabConsumiblesProps> = ({
  consumables,
  consumableLogs,
  isAdmin,
  handleDeleteConsumable,
  openDispatchModal,
  setShowConsumableModal
}) => {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold dm-text tracking-tight">Bodega de Insumos</h2>
        </div>
        <button 
          onClick={() => setShowConsumableModal(true)} 
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm font-bold shadow-md shadow-blue-600/20 w-full md:w-auto"
        >
          <Plus size={16}/> Crear SKU
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {consumables.map(c => (
            <div 
              key={c.id} 
              className="dm-surface p-5 rounded-2xl shadow-sm border dm-border relative group hover:shadow-md transition-all hover:border-blue-300 flex flex-col justify-between"
            >
              {isAdmin && (
                <button 
                  onClick={() => handleDeleteConsumable(c.id)} 
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-md p-1 border border-slate-100"
                >
                  <Trash2 size={16}/>
                </button>
              )}
              
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Package size={12}/> {c.category}
                </p>
                <h3 className="font-bold text-slate-800 text-sm mb-4 pr-6 leading-tight whitespace-normal">
                  {c.name}
                </h3>
              </div>
              
              {/* Barra de stock */}
              <div className="mt-3 mb-1">
                {(() => {
                  const pct = c.minStock > 0 
                    ? Math.min(100, Math.round(c.quantity / (c.minStock * 3) * 100)) 
                    : 100;
                  const col = c.quantity <= c.minStock 
                    ? 'bg-red-500' 
                    : c.quantity <= c.minStock * 1.5 
                      ? 'bg-amber-400' 
                      : 'bg-emerald-500';
                  
                  const logs = consumableLogs.filter(l => l.consumableId === c.id);
                  const avgD = logs.length >= 2 ? (() => {
                    const s = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    const durationDays = (new Date(s[s.length - 1].date).getTime() - new Date(s[0].date).getTime()) / (86400000 * Math.max(1, s.length - 1));
                    return logs.reduce((total, log) => total + log.quantity, 0) / Math.max(1, durationDays);
                  })() : 0;
                  const daysLeft = avgD > 0 ? Math.round(c.quantity / avgD) : null;
                  
                  return (
                    <>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1">
                        <div className={`h-1.5 rounded-full ${col}`} style={{ width: `${pct}%` }}/>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-[9px] font-bold ${c.quantity <= c.minStock ? 'text-red-500' : 'dm-text3'}`}>
                          mín {c.minStock}
                        </span>
                        {daysLeft !== null && (
                          <span className="text-[9px] dm-text3">~{daysLeft}d restantes</span>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
              
              <div className="flex items-end justify-between mt-2 pt-3 border-t dm-border">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-black tracking-tight leading-none ${
                      c.quantity <= c.minStock ? 'text-red-600' : 'dm-text'
                    }`}>
                      {c.quantity}
                    </span>
                    <span className="text-xs font-semibold dm-text3">{c.unit}</span>
                  </div>
                </div>
                <button 
                  onClick={() => openDispatchModal(c)} 
                  className="text-xs font-bold text-blue-700 bg-blue-50/50 border border-blue-100 px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Entregar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
