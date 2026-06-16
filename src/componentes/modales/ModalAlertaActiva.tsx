import React from 'react';
import { X, AlertOctagon, ChevronRight } from 'lucide-react';
import type { ToolItem, Loan, ConsumableItem } from '../../tipos';

interface ModalAlertaActivaProps {
  alertModal: {
    message: string;
    type: 'calibration' | 'loan' | 'stock';
    id?: string;
    loanId?: string;
    consumableId?: string;
  };
  setAlertModal: (alert: any) => void;
  tools: ToolItem[];
  loans: Loan[];
  consumables: ConsumableItem[];
  getEngineerName: (id: string) => string;
  getToolName: (id: string) => string;
  setActiveTab: (tab: any) => void;
  setSelectedTool: (tool: ToolItem) => void;
  setModalTab: (tab: any) => void;
  setShowDetailsModal: (show: boolean) => void;
  setNewMaintenance: React.Dispatch<React.SetStateAction<any>>;
}

export const ModalAlertaActiva: React.FC<ModalAlertaActivaProps> = ({
  alertModal,
  setAlertModal,
  tools,
  loans,
  consumables,
  getEngineerName,
  getToolName,
  setActiveTab,
  setSelectedTool,
  setModalTab,
  setShowDetailsModal,
  setNewMaintenance
}) => {
  const tool = alertModal.type === 'calibration' && alertModal.id ? tools.find(t => t.id === alertModal.id) : null;
  const loan = alertModal.type === 'loan' && alertModal.loanId ? loans.find(l => l.id === alertModal.loanId) : null;
  const consumable = alertModal.type === 'stock' && alertModal.consumableId ? consumables.find(c => c.id === alertModal.consumableId) : null;

  const tc = alertModal.type === 'calibration' ? {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    label: 'Calibración próxima',
    btn: 'Ir a la herramienta'
  } : alertModal.type === 'loan' ? {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Préstamo vencido',
    btn: 'Ver préstamos'
  } : {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-500',
    badge: 'bg-red-100 text-red-800 border-red-200',
    label: 'Stock crítico',
    btn: 'Ir a consumibles'
  };

  const handleActionClick = () => {
    setAlertModal(null);
    if (alertModal.type === 'calibration' && tool) {
      setActiveTab('inventory');
      setSelectedTool(tool);
      setModalTab('maintenance');
      setShowDetailsModal(true);
      const today = new Date().toISOString().split('T')[0];
      setNewMaintenance({
        description: 'Calibración periódica',
        cost: 0,
        technician: '',
        isCalibration: true,
        newLastCal: today,
        newNextCal: ''
      });
    } else if (alertModal.type === 'loan') {
      setActiveTab('loans');
    } else {
      setActiveTab('consumables');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={() => setAlertModal(null)}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        <div className={`${tc.bg} ${tc.border} border-b px-6 py-5 flex items-start justify-between gap-4`}>
          <div className="flex items-start gap-3">
            <AlertOctagon size={18} className={`${tc.icon} mt-0.5 shrink-0`}/>
            <div>
              <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${tc.badge} inline-block mb-1.5`}>
                {tc.label}
              </span>
              <p className="font-bold text-slate-900 text-sm leading-snug">{alertModal.message}</p>
            </div>
          </div>
          <button 
            onClick={() => setAlertModal(null)} 
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg shrink-0"
          >
            <X size={15}/>
          </button>
        </div>
        
        <div className="px-6 py-5 space-y-3">
          {tool && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">N.° de Serie</p>
                <p className="text-xs font-bold text-slate-800 font-mono">{tool.serial || '—'}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mb-1">Próxima calibración</p>
                <p className="text-xs font-bold text-amber-800">
                  {tool.nextCalibration ? new Date(tool.nextCalibration).toLocaleDateString() : '—'}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Última calibración</p>
                <p className="text-xs font-bold text-slate-800">
                  {tool.lastCalibration ? new Date(tool.lastCalibration).toLocaleDateString() : '—'}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Condición</p>
                <p className="text-xs font-semibold text-slate-800">{tool.condition}</p>
              </div>
            </div>
          )}
          
          {loan && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ingeniero</p>
                <p className="text-xs font-bold text-slate-800">{getEngineerName(loan.engineerId)}</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fecha de salida</p>
                <p className="text-xs font-bold text-slate-800 font-mono">{new Date(loan.dateOut).toLocaleDateString()}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 col-span-2">
                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mb-1">Días fuera de bodega</p>
                <p className="text-lg font-black text-blue-800">
                  {Math.ceil((new Date().getTime() - new Date(loan.dateOut).getTime()) / 86400000)} días
                </p>
              </div>
            </div>
          )}
          
          {consumable && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-[9px] font-bold text-red-600 uppercase tracking-wider mb-1">Stock actual</p>
                <p className="text-lg font-black text-red-800">
                  {consumable.quantity} <span className="text-xs">{consumable.unit}</span>
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mínimo requerido</p>
                <p className="text-lg font-black text-slate-800">
                  {consumable.minStock} <span className="text-xs">{consumable.unit}</span>
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
          <button 
            onClick={() => setAlertModal(null)} 
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 shadow-sm"
          >
            Cerrar
          </button>
          <button 
            onClick={handleActionClick} 
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md"
          >
            <ChevronRight size={13}/> {tc.btn}
          </button>
        </div>
      </div>
    </div>
  );
};
