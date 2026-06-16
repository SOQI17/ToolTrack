import React from 'react';
import { ChevronLeft, ChevronRight, AlertOctagon } from 'lucide-react';
import type { ToolItem } from '../tipos';

interface TabCalibracionesProps {
  tools: ToolItem[];
  calendarMonth: { year: number; month: number };
  setCalendarMonth: React.Dispatch<React.SetStateAction<{ year: number; month: number }>>;
  setSelectedTool: (tool: ToolItem) => void;
  setModalTab: (tab: any) => void;
  setShowDetailsModal: (show: boolean) => void;
  setNewMaintenance: React.Dispatch<React.SetStateAction<any>>;
}

export const TabCalibraciones: React.FC<TabCalibracionesProps> = ({
  tools,
  calendarMonth,
  setCalendarMonth,
  setSelectedTool,
  setModalTab,
  setShowDetailsModal,
  setNewMaintenance
}) => {
  const clsA = tools.filter(t => t.abcCategory === 'A' && t.nextCalibration);
  const now = new Date();
  const ms = new Date(calendarMonth.year, calendarMonth.month, 1);
  const me = new Date(calendarMonth.year, calendarMonth.month + 1, 0);
  
  const overdue = clsA.filter(t => new Date(t.nextCalibration!) < now);
  const inMonth = clsA.filter(t => {
    const d = new Date(t.nextCalibration!);
    return d >= ms && d <= me;
  });
  const upcoming = clsA.filter(t => {
    const d = new Date(t.nextCalibration!);
    return d > me && d <= new Date(me.getTime() + 30 * 86400000);
  });

  const handleRegisterCalibration = (t: ToolItem) => {
    setSelectedTool(t);
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
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex-shrink-0 flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold dm-text tracking-tight">Calibraciones</h2>
          <p className="text-xs dm-text3 mt-1">Herramientas Clase A</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCalendarMonth(m => {
              const d = new Date(m.year, m.month - 1);
              return { year: d.getFullYear(), month: d.getMonth() };
            })} 
            className="p-2 dm-surface border dm-border rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
          >
            <ChevronLeft size={16}/>
          </button>
          <span className="text-sm font-bold dm-text min-w-[140px] text-center">
            {new Date(calendarMonth.year, calendarMonth.month).toLocaleString('es-EC', {
              month: 'long',
              year: 'numeric'
            }).replace(/^\w/, c => c.toUpperCase())}
          </span>
          <button 
            onClick={() => setCalendarMonth(m => {
              const d = new Date(m.year, m.month + 1);
              return { year: d.getFullYear(), month: d.getMonth() };
            })} 
            className="p-2 dm-surface border dm-border rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
          >
            <ChevronRight size={16}/>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-6">
        {overdue.length > 0 && (
          <div className="bg-red-500/10 border border-red-400/20 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <AlertOctagon size={13}/> Vencidas ({overdue.length})
            </h3>
            <div className="space-y-2">
              {overdue.map(t => (
                <div key={t.id} className="flex items-center gap-3 dm-surface border dm-border rounded-xl px-4 py-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold dm-text truncate">{t.name}</p>
                    <p className="text-[10px] dm-text3 font-mono">SN: {t.serial}</p>
                  </div>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded shrink-0">
                    {new Date(t.nextCalibration!).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => handleRegisterCalibration(t)} 
                    className="text-[10px] font-bold text-blue-600 hover:underline shrink-0"
                  >
                    Registrar →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="dm-surface border dm-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold dm-text3 uppercase tracking-widest mb-4">
            {inMonth.length === 0 ? 'Sin calibraciones este mes' : `Este mes (${inMonth.length})`}
          </h3>
          {inMonth.length === 0 ? (
            <p className="text-sm dm-text3 text-center py-8">No hay calibraciones para este período.</p>
          ) : (
            <div className="space-y-2">
              {inMonth.sort((a, b) => new Date(a.nextCalibration!).getTime() - new Date(b.nextCalibration!).getTime()).map(t => {
                const d = new Date(t.nextCalibration!);
                const days = Math.ceil((d.getTime() - now.getTime()) / 86400000);
                return (
                  <div 
                    key={t.id} 
                    className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${
                      days < 0 
                        ? 'border-red-400/30 bg-red-500/5' 
                        : days < 7 
                          ? 'border-amber-400/30 bg-amber-500/5' 
                          : 'dm-border dm-surface'
                    }`}
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-slate-400 leading-none">
                        {d.toLocaleString('es', { month: 'short' }).toUpperCase()}
                      </span>
                      <span className="text-sm font-black text-slate-700">{d.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold dm-text truncate">{t.name}</p>
                      <p className="text-[10px] dm-text3 font-mono">SN: {t.serial}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                      days < 0 
                        ? 'text-red-600 bg-red-50 border-red-200' 
                        : days === 0 
                          ? 'text-amber-700 bg-amber-50 border-amber-200' 
                          : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    }`}>
                      {days < 0 ? `${Math.abs(days)}d vencido` : days === 0 ? 'Hoy' : `${days}d`}
                    </span>
                    <button 
                      onClick={() => handleRegisterCalibration(t)} 
                      className="text-[10px] font-bold text-blue-600 hover:underline shrink-0"
                    >
                      Registrar →
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {upcoming.length > 0 && (
          <div className="dm-surface2 border dm-border rounded-2xl p-5">
            <h3 className="text-xs font-bold dm-text3 uppercase tracking-widest mb-3">
              Próximos 30 días ({upcoming.length})
            </h3>
            <div className="space-y-2">
              {upcoming.map(t => (
                <div key={t.id} className="flex items-center gap-3 dm-surface border dm-border rounded-xl px-4 py-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"/>
                  <p className="text-xs font-semibold dm-text flex-1 truncate">{t.name}</p>
                  <span className="text-[10px] dm-text3 font-mono">
                    {new Date(t.nextCalibration!).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
