import React from 'react';
import { CheckCircle } from 'lucide-react';
import type { ToolItem } from '../../tipos';

interface ModalConfirmarPrestamoProps {
  newLoan: {
    engineerId: string;
    purpose: string;
    client: string;
    project: string;
  };
  currentLoanTools: ToolItem[];
  setLoanConfirmStep: (show: boolean) => void;
  getEngineerName: (id: string) => string;
  handleCreateLoan: () => void;
}

export const ModalConfirmarPrestamo: React.FC<ModalConfirmarPrestamoProps> = ({
  newLoan,
  currentLoanTools,
  setLoanConfirmStep,
  getEngineerName,
  handleCreateLoan
}) => {
  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" 
      onClick={() => setLoanConfirmStep(false)}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-[#1a3a6b] px-6 py-5">
          <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">
            Confirmación de salida
          </p>
          <p className="font-bold text-white text-lg">¿Autorizar préstamo?</p>
        </div>
        
        <div className="px-6 py-5 space-y-3">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Custodio responsable
            </p>
            <p className="text-sm font-bold text-slate-900">{getEngineerName(newLoan.engineerId)}</p>
          </div>
          
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Activos a despachar ({currentLoanTools.length})
            </p>
            <div className="space-y-1">
              {currentLoanTools.map(t => (
                <div key={t.id} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"/>
                  <p className="text-xs font-semibold text-slate-700 truncate flex-1">{t.name}</p>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">SN: {t.serial}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Proyecto</p>
            <p className="text-xs font-semibold text-slate-800">
              {newLoan.project || newLoan.client || 'General'}
            </p>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex gap-3">
          <button 
            onClick={() => setLoanConfirmStep(false)} 
            className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100"
          >
            Corregir
          </button>
          <button 
            onClick={() => {
              setLoanConfirmStep(false);
              handleCreateLoan();
            }} 
            className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 shadow-md"
          >
            <CheckCircle size={14}/> Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
