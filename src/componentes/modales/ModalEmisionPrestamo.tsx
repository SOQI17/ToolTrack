import React from 'react';
import { X, Users, ChevronRight, Search, Check } from 'lucide-react';
import type { ToolItem, Engineer } from '../../tipos';
import { BadgeABC } from '../Indicadores';

interface ModalEmisionPrestamoProps {
  setShowLoanModal: (show: boolean) => void;
  newLoan: {
    engineerId: string;
    purpose: string;
    client: string;
    project: string;
  };
  setNewLoan: React.Dispatch<React.SetStateAction<any>>;
  tools: ToolItem[];
  engineers: Engineer[];
  currentLoanTools: ToolItem[];
  toggleToolSelectionForLoan: (tool: ToolItem) => void;
  loanSearchTerm: string;
  setLoanSearchTerm: (val: string) => void;
  setLoanConfirmStep: (show: boolean) => void;
  appZoom: number;
  engineerSelectorOpen: boolean;
  setEngineerSelectorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  engineerSelectorSearch: string;
  setEngineerSelectorSearch: (val: string) => void;
}

export const ModalEmisionPrestamo: React.FC<ModalEmisionPrestamoProps> = ({
  setShowLoanModal,
  newLoan,
  setNewLoan,
  tools,
  engineers,
  currentLoanTools,
  toggleToolSelectionForLoan,
  loanSearchTerm,
  setLoanSearchTerm,
  setLoanConfirmStep,
  appZoom,
  engineerSelectorOpen,
  setEngineerSelectorOpen,
  engineerSelectorSearch,
  setEngineerSelectorSearch
}) => {
  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" 
      style={{ zoom: 1 / appZoom } as React.CSSProperties}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <h3 className="font-black text-2xl text-slate-900 tracking-tight">Emisión de Préstamo</h3>
          <button 
            onClick={() => setShowLoanModal(false)} 
            className="text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X size={20}/>
          </button>
        </div>
        
        <div className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Asignación de Responsable *
            </label>
            <button 
              type="button" 
              onClick={() => { setEngineerSelectorOpen(o => !o); setEngineerSelectorSearch(''); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left shadow-sm transition-all ${
                newLoan.engineerId ? 'border-blue-400 bg-blue-50/40' : 'border-slate-300 bg-white hover:border-blue-400'
              }`}
            >
              {newLoan.engineerId ? (() => {
                const eng = engineers.find(e => e.id === newLoan.engineerId);
                return eng ? (
                  <>
                    <div className="w-9 h-9 rounded-xl bg-[#1a3a6b] flex items-center justify-center text-white font-black text-sm shrink-0">
                      {eng.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 text-sm truncate">{eng.name}</p>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{eng.department}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">✓</span>
                  </>
                ) : null;
              })() : (
                <>
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Users size={15} className="text-slate-400"/>
                  </div>
                  <span className="text-slate-400 font-medium text-sm flex-1">Seleccione personal técnico...</span>
                  <ChevronRight size={15} className={`text-slate-400 transition-transform ${engineerSelectorOpen ? 'rotate-90' : ''}`}/>
                </>
              )}
            </button>
            
            {engineerSelectorOpen && (
              <div className="mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-30 relative">
                <div className="p-3 border-b border-slate-100">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input 
                      autoFocus 
                      placeholder="Buscar técnico..." 
                      className="w-full pl-8 pr-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400" 
                      value={engineerSelectorSearch} 
                      onChange={e => setEngineerSelectorSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-52 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
                  {engineers.filter(e => 
                    e.name.toLowerCase().includes(engineerSelectorSearch.toLowerCase()) || 
                    e.department.toLowerCase().includes(engineerSelectorSearch.toLowerCase())
                  ).map(e => {
                    const isSel = newLoan.engineerId === e.id;
                    return (
                      <button 
                        key={e.id} 
                        type="button" 
                        onClick={() => {
                          setNewLoan({ ...newLoan, engineerId: e.id });
                          setEngineerSelectorOpen(false);
                        }} 
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isSel ? 'bg-blue-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-[#1a3a6b] flex items-center justify-center text-white font-black text-sm shrink-0">
                          {e.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm truncate ${isSel ? 'text-blue-900' : 'text-slate-800'}`}>
                            {e.name}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest truncate">{e.department}</p>
                        </div>
                        {isSel && <Check size={13} className="text-blue-600 shrink-0"/>}
                      </button>
                    );
                  })}
                  {engineers.filter(e => e.name.toLowerCase().includes(engineerSelectorSearch.toLowerCase())).length === 0 && (
                    <div className="py-6 text-center text-xs text-slate-400">Sin resultados</div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm shadow-blue-500/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <div className="flex justify-between items-end mb-4">
              <label className="text-sm font-black text-slate-900">Selección de Inventario</label>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-xs font-black shadow-sm border border-blue-200">
                {currentLoanTools.length} en carrito
              </span>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                className="w-full pl-11 pr-4 py-3 border border-slate-300 bg-slate-50 rounded-xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner" 
                placeholder="Escanear o buscar código/nombre..." 
                value={loanSearchTerm} 
                onChange={e => setLoanSearchTerm(e.target.value)} 
              />
            </div>
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 divide-y divide-slate-100 custom-scrollbar">
              {tools.filter(t => 
                t.status === 'available' && 
                (t.condition || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() !== 'fuera de servicio' &&
                (t.name.toLowerCase().includes(loanSearchTerm.toLowerCase()) || 
                 t.serial.toLowerCase().includes(loanSearchTerm.toLowerCase()))
              ).map(t => {
                const isSelected = currentLoanTools.some(ct => ct.id === t.id);
                return (
                  <div 
                    key={t.id} 
                    onClick={() => toggleToolSelectionForLoan(t)} 
                    className={`p-3 text-sm flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-white'
                    }`}
                  >
                    <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-blue-600 border-blue-600 shadow-sm' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check size={12} className="text-white font-bold" />}
                    </div>
                    <div className="flex-1 truncate">
                      <p className={`font-bold ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>{t.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono font-medium mt-0.5">SN: {t.serial}</p>
                    </div>
                    <BadgeABC category={t.abcCategory}/>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Ubicación Física
              </label>
              <input 
                className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm" 
                placeholder="Ej. Planta Sur" 
                value={newLoan.client} 
                onChange={e => setNewLoan({ ...newLoan, client: e.target.value })} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Naturaleza del Trabajo
              </label>
              <select 
                className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm" 
                value={newLoan.purpose} 
                onChange={e => setNewLoan({ ...newLoan, purpose: e.target.value })}
              >
                <option>Mantenimiento</option>
                <option>Instalación</option>
                <option>Diagnóstico</option>
                <option>Obra Civil</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Centro de Costo / Proyecto
              </label>
              <input 
                className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm" 
                placeholder="Código de proyecto (Opcional)" 
                value={newLoan.project || ''} 
                onChange={e => setNewLoan({ ...newLoan, project: e.target.value })} 
              />
            </div>
          </div>
        </div>
        
        <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0">
          <button 
            onClick={() => setShowLoanModal(false)} 
            className="px-6 py-3 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-100 shadow-sm transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={() => {
              if (!newLoan.engineerId || currentLoanTools.length === 0) return;
              setLoanConfirmStep(true);
            }} 
            disabled={currentLoanTools.length === 0 || !newLoan.engineerId} 
            className="px-8 py-3 bg-blue-600 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
          >
            Revisar y Autorizar <ChevronRight size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
};
