import React from 'react';
import { X, Check, CheckCircle } from 'lucide-react';
import type { Loan } from '../../tipos';

interface ModalDevolucionProps {
  returnLoan: Loan;
  setShowReturnModal: (show: boolean) => void;
  selectedReturnTools: string[];
  setSelectedReturnTools: React.Dispatch<React.SetStateAction<string[]>>;
  returnCondition: string;
  setReturnCondition: (val: string) => void;
  returnNotes: string;
  setReturnNotes: (val: string) => void;
  currentUser: string;
  confirmReturn: () => void;
}

export const ModalDevolucion: React.FC<ModalDevolucionProps> = ({
  returnLoan,
  setShowReturnModal,
  selectedReturnTools,
  setSelectedReturnTools,
  returnCondition,
  setReturnCondition,
  returnNotes,
  setReturnNotes,
  currentUser,
  confirmReturn
}) => {
  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" 
      onClick={() => setShowReturnModal(false)}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-emerald-600 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest mb-1">
              Registro de devolución
            </p>
            <p className="font-bold text-white text-lg leading-tight">Recibir activos</p>
          </div>
          <button onClick={() => setShowReturnModal(false)} className="text-emerald-300 hover:text-white p-1.5 rounded-lg">
            <X size={16}/>
          </button>
        </div>
        
        <div className="px-6 py-5 space-y-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Seleccionar activos a recibir
              </p>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setSelectedReturnTools(returnLoan.tools?.map(t => t.id) || [])} 
                  className="text-[9px] font-bold text-blue-600 hover:underline"
                >
                  Todos
                </button>
                <span className="text-slate-300 text-[9px]">·</span>
                <button 
                  type="button" 
                  onClick={() => setSelectedReturnTools([])} 
                  className="text-[9px] font-bold text-slate-400 hover:underline"
                >
                  Ninguno
                </button>
              </div>
            </div>
            
            <div className="space-y-1.5">
              {(returnLoan.tools || []).map(t => (
                <div 
                  key={t.id} 
                  onClick={() => setSelectedReturnTools(prev => 
                    prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id]
                  )} 
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer border transition-all ${
                    selectedReturnTools.includes(t.id) 
                      ? 'bg-emerald-50 border-emerald-300' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    selectedReturnTools.includes(t.id) ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300'
                  }`}>
                    {selectedReturnTools.includes(t.id) && <Check size={10} className="text-white"/>}
                  </div>
                  <p className="text-xs font-semibold text-slate-700 flex-1">{t.name}</p>
                  <span className="text-[10px] text-slate-400 font-mono">{t.serial}</span>
                </div>
              ))}
            </div>
            
            {selectedReturnTools.length === 0 && (
              <p className="text-[10px] text-amber-600 font-medium mt-2">Selecciona al menos un activo</p>
            )}
            
            {selectedReturnTools.length > 0 && selectedReturnTools.length < (returnLoan.tools?.length || 0) && (
              <p className="text-[10px] text-blue-600 font-medium mt-2">
                ⚠ Devolución parcial — {(returnLoan.tools?.length || 0) - selectedReturnTools.length} activo(s) quedan en préstamo
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Condición al recibir *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Bueno', 'Con daños', 'Requiere revisión'].map(c => (
                <button 
                  key={c} 
                  type="button" 
                  onClick={() => setReturnCondition(c)} 
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                    returnCondition === c 
                      ? (c === 'Bueno' 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : c === 'Con daños' 
                            ? 'bg-red-600 text-white border-red-600' 
                            : 'bg-amber-500 text-white border-amber-500') 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Observaciones <span className="text-slate-300 normal-case tracking-normal font-normal">(opcional)</span>
            </label>
            <textarea 
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-blue-400 resize-none bg-slate-50" 
              rows={2} 
              placeholder="Daños observados, accesorios faltantes..." 
              value={returnNotes} 
              onChange={e => setReturnNotes(e.target.value)}
            />
          </div>
          
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Recibido por</p>
              <p className="text-xs font-bold text-slate-800">{currentUser}</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              {selectedReturnTools.length} de {returnLoan.tools?.length || 0}
            </span>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex gap-3">
          <button 
            onClick={() => setShowReturnModal(false)} 
            className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button 
            onClick={confirmReturn} 
            disabled={selectedReturnTools.length === 0} 
            className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            <CheckCircle size={14}/> Confirmar devolución
          </button>
        </div>
      </div>
    </div>
  );
};
