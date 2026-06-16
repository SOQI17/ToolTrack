import React from 'react';
import { Printer } from 'lucide-react';
import type { ToolItem, Loan, Engineer } from '../tipos';

interface TabReportesProps {
  tools: ToolItem[];
  loans: Loan[];
  engineers: Engineer[];
  alerts: any[];
  generateReportPDF: (tools: ToolItem[], loans: Loan[], engineers: Engineer[]) => void;
}

export const TabReportes: React.FC<TabReportesProps> = ({
  tools,
  loans,
  engineers,
  alerts,
  generateReportPDF
}) => {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex-shrink-0 flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold dm-text tracking-tight">Reportes</h2>
          <p className="text-xs dm-text3 mt-1">Análisis operativo de ToolTrack</p>
        </div>
        <button 
          onClick={() => generateReportPDF(tools, loans, engineers)} 
          className="flex items-center gap-2 bg-[#1a3a6b] text-white px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors text-sm font-bold shadow-md"
        >
          <Printer size={15}/> Exportar PDF
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total activos', value: tools.length, sub: 'en inventario' },
            { label: 'Préstamos activos', value: loans.filter(l => !l.dateIn).length, sub: 'fuera de bodega' },
            { label: 'Tasa devolución', value: loans.length > 0 ? Math.round(loans.filter(l => l.dateIn).length / loans.length * 100) + '%' : '—', sub: 'préstamos cerrados' },
            { label: 'Alertas activas', value: alerts.length, sub: 'requieren atención' }
          ].map((k, i) => (
            <div key={i} className="dm-surface border dm-border rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold dm-text3 uppercase tracking-wider mb-1">{k.label}</p>
              <p className="text-3xl font-black dm-text">{k.value}</p>
              <p className="text-[10px] dm-text3 mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>
        
        <div className="dm-surface border dm-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold dm-text3 uppercase tracking-widest mb-4">Préstamos por ingeniero</h3>
          <div className="space-y-3">
            {[...engineers]
              .sort((a, b) => loans.filter(l => l.engineerId === b.id).length - loans.filter(l => l.engineerId === a.id).length)
              .map(e => {
                const cnt = loans.filter(l => l.engineerId === e.id).length;
                const act = loans.filter(l => l.engineerId === e.id && !l.dateIn).length;
                const max = Math.max(...engineers.map(eng => loans.filter(l => l.engineerId === eng.id).length), 1);
                return (
                  <div key={e.id} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#1a3a6b] flex items-center justify-center text-white text-[10px] font-black shrink-0">
                      {e.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-semibold dm-text truncate">{e.name}</span>
                        <span className="text-[10px] dm-text3 shrink-0 ml-2">
                          {cnt} · <span className="text-blue-500 font-bold">{act} activo{act !== 1 ? 's' : ''}</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-[#1a3a6b]" style={{ width: `${(cnt / max) * 100}%` }}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            {engineers.length === 0 && (
              <p className="text-xs dm-text3 text-center py-4">Sin personal registrado.</p>
            )}
          </div>
        </div>
        
        <div className="dm-surface border dm-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold dm-text3 uppercase tracking-widest mb-4">Herramientas más prestadas</h3>
          <div className="space-y-2">
            {(() => {
              const freq: Record<string, { name: string; count: number }> = {};
              loans.forEach(l => {
                l.tools?.forEach(t => {
                  if (!freq[t.id]) freq[t.id] = { name: t.name, count: 0 };
                  freq[t.id].count++;
                });
              });
              return Object.values(freq)
                .sort((a, b) => b.count - a.count)
                .slice(0, 8)
                .map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-300 w-5 shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-semibold dm-text flex-1 truncate">{item.name}</span>
                    <span className="text-[10px] font-bold dm-text3 bg-slate-100 px-2 py-0.5 rounded">
                      {item.count} usos
                    </span>
                  </div>
                ));
            })()}
            {loans.length === 0 && (
              <p className="text-xs dm-text3 text-center py-4">Sin datos aún.</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="dm-surface border dm-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold dm-text3 uppercase tracking-widest mb-3">Tiempo promedio fuera</h3>
            {(() => {
              const cl = loans.filter(l => l.dateIn);
              if (!cl.length) return <p className="text-xs dm-text3 text-center py-6">Sin datos.</p>;
              const avg = cl.reduce((s, l) => s + (new Date(l.dateIn!).getTime() - new Date(l.dateOut).getTime()) / 86400000, 0) / cl.length;
              return (
                <div className="text-center py-4">
                  <p className="text-5xl font-black text-[#1a3a6b]">{avg.toFixed(1)}</p>
                  <p className="text-sm dm-text3 mt-1">días promedio ({cl.length} préstamos)</p>
                </div>
              );
            })()}
          </div>
          
          <div className="dm-surface border dm-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold dm-text3 uppercase tracking-widest mb-3">Estado del inventario</h3>
            <div className="space-y-2 mt-2">
              {[
                { label: 'Disponibles', val: tools.filter(t => t.status === 'available').length, color: 'bg-emerald-500' },
                { label: 'En uso', val: tools.filter(t => t.status === 'in-use').length, color: 'bg-blue-500' },
                { label: 'Mantenimiento', val: tools.filter(t => t.status === 'maintenance').length, color: 'bg-amber-400' },
                { label: 'Dañados', val: tools.filter(t => t.status === 'broken').length, color: 'bg-red-500' }
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${s.color} shrink-0`}/>
                  <span className="text-xs dm-text2 flex-1">{s.label}</span>
                  <span className="text-xs font-black dm-text">{s.val}</span>
                  <span className="text-[10px] dm-text3">
                    {tools.length > 0 ? Math.round(s.val / tools.length * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
