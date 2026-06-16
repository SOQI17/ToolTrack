import React from 'react';
import { X, Users, CheckCircle } from 'lucide-react';
import type { Engineer, Loan, ConsumableLog } from '../../tipos';

interface ModalDetalleIngenieroProps {
  selectedEngineer: Engineer;
  setShowEngineerDetailsModal: (show: boolean) => void;
  engineerModalTab: 'loans' | 'consumables';
  setEngineerModalTab: (tab: any) => void;
  getEngineerLoans: (id: string) => Loan[];
  getEngineerConsumables: (id: string) => ConsumableLog[];
  appZoom: number;
}

export const ModalDetalleIngeniero: React.FC<ModalDetalleIngenieroProps> = ({
  selectedEngineer,
  setShowEngineerDetailsModal,
  engineerModalTab,
  setEngineerModalTab,
  getEngineerLoans,
  getEngineerConsumables,
  appZoom
}) => {
  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" 
      style={{ zoom: 1 / appZoom } as React.CSSProperties}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="p-8 border-b flex justify-between items-start bg-slate-900 text-white relative overflow-hidden shrink-0">
          <div className="absolute right-0 top-0 opacity-5 pointer-events-none translate-x-1/4 -translate-y-1/4">
            <Users size={300}/>
          </div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl border border-blue-400/30 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-900/50">
              {selectedEngineer.name.charAt(0)}
            </div>
            <div>
              <p className="text-blue-400 font-bold tracking-widest uppercase text-[10px] mb-1.5">
                Expediente de Personal
              </p>
              <h2 className="text-3xl font-black tracking-tight mb-2 leading-none">
                {selectedEngineer.name}
              </h2>
              <p className="text-slate-300 font-semibold bg-white/10 px-3 py-1 rounded-lg w-max text-xs border border-white/5">
                {selectedEngineer.department}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowEngineerDetailsModal(false)} 
            className="bg-white/5 hover:bg-white/20 p-2 rounded-full transition-colors relative z-10 border border-transparent hover:border-white/10"
          >
            <X size={20}/>
          </button>
        </div>
        
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-8 gap-8 shadow-sm z-10 relative shrink-0 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setEngineerModalTab('loans')} 
            className={`py-4 text-sm font-black border-b-2 transition-colors outline-none tracking-wide whitespace-nowrap ${
              engineerModalTab === 'loans' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            HISTORIAL DE EQUIPOS
          </button>
          <button 
            onClick={() => setEngineerModalTab('consumables')} 
            className={`py-4 text-sm font-black border-b-2 transition-colors outline-none tracking-wide whitespace-nowrap ${
              engineerModalTab === 'consumables' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            MATERIAL ENTREGADO
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden bg-[#fafafa] flex flex-col min-h-0">
          {engineerModalTab === 'loans' && (
            <div className="overflow-auto custom-scrollbar flex-1 p-6 md:p-8">
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm relative table-auto">
                  <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-md shadow-[0_1px_0_0_#e2e8f0] text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-3 bg-transparent whitespace-nowrap">Equipos Asignados</th>
                      <th className="px-6 py-3 bg-transparent whitespace-nowrap">Proyecto / Destino</th>
                      <th className="px-6 py-3 bg-transparent whitespace-nowrap">Fechas</th>
                      <th className="px-6 py-3 text-center bg-transparent whitespace-nowrap">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dm-divide">
                    {getEngineerLoans(selectedEngineer.id).map(l => (
                      <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3 font-bold text-slate-800 text-[13px] min-w-[200px] whitespace-normal leading-tight">
                          {l.tools ? l.tools.map(t => t.name).join(', ') : 'Varios'}
                        </td>
                        <td className="px-6 py-3 text-slate-600 font-medium text-xs whitespace-nowrap">
                          {l.project || l.purpose}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="font-mono text-slate-900 text-xs font-semibold">
                            {new Date(l.dateOut).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            ➔ {l.dateIn ? new Date(l.dateIn).toLocaleDateString() : 'Pendiente'}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-center whitespace-nowrap">
                          {l.dateIn ? (
                            <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                              <CheckCircle size={12}/> Cerrado
                            </span>
                          ) : (
                            <span className="inline-block text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm animate-pulse">
                              Activo
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {getEngineerLoans(selectedEngineer.id).length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400 font-medium bg-slate-50/50">
                          El expediente está limpio.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {engineerModalTab === 'consumables' && (
            <div className="overflow-auto custom-scrollbar flex-1 p-6 md:p-8">
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm relative table-auto">
                  <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-md shadow-[0_1px_0_0_#e2e8f0] text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-3 bg-transparent whitespace-nowrap">Fecha de Retiro</th>
                      <th className="px-6 py-3 bg-transparent whitespace-nowrap">Insumo</th>
                      <th className="px-6 py-3 text-right pr-6 bg-transparent whitespace-nowrap">Volumen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dm-divide">
                    {getEngineerConsumables(selectedEngineer.id).map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="font-mono text-slate-900 text-xs font-semibold">
                            {new Date(log.date).toLocaleDateString()}
                          </span>{' '}
                          <span className="text-[10px] text-slate-400 ml-1 font-mono">
                            {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-bold text-slate-800 text-[13px] whitespace-normal min-w-[200px]">
                          {log.consumableName}
                        </td>
                        <td className="px-6 py-3 text-right pr-6 font-black text-blue-600 text-base whitespace-nowrap">
                          {log.quantity}
                        </td>
                      </tr>
                    ))}
                    {getEngineerConsumables(selectedEngineer.id).length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-slate-400 font-medium bg-slate-50/50">
                          No hay retiros registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
