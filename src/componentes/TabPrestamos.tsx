import React from 'react';
import { 
  FileSpreadsheet, ArrowRightLeft, Search, X, Building2, Printer 
} from 'lucide-react';
import type { Loan, Engineer, ToolItem } from '../tipos';

interface TabPrestamosProps {
  loans: Loan[];
  engineers: Engineer[];
  tools: ToolItem[];
  loanFilter: 'ALL' | 'active' | 'returned';
  setLoanFilter: (val: 'ALL' | 'active' | 'returned') => void;
  loanSearch: string;
  setLoanSearch: (val: string) => void;
  loanDateFrom: string;
  setLoanDateFrom: (val: string) => void;
  loanDateTo: string;
  setLoanDateTo: (val: string) => void;
  getEngineerName: (id: string) => string;
  getToolName: (id: string) => string;
  handleOpenReturnModal: (loan: Loan) => void;
  generateLoanPDF: (loan: Loan, engineerName: string) => void;
  exportLoans: () => void;
  setShowLoanModal: (show: boolean) => void;
}

export const TabPrestamos: React.FC<TabPrestamosProps> = ({
  loans,
  engineers,
  tools,
  loanFilter,
  setLoanFilter,
  loanSearch,
  setLoanSearch,
  loanDateFrom,
  setLoanDateFrom,
  loanDateTo,
  setLoanDateTo,
  getEngineerName,
  getToolName,
  handleOpenReturnModal,
  generateLoanPDF,
  exportLoans,
  setShowLoanModal
}) => {
  const filteredLoans = loans.filter(l => {
    const q = loanSearch.toLowerCase().trim();
    if (loanFilter === 'active' && l.dateIn) return false;
    if (loanFilter === 'returned' && !l.dateIn) return false;
    
    if (q) {
      const eng = getEngineerName(l.engineerId).toLowerCase();
      const toolNames = (l.tools && l.tools.length > 0 
        ? l.tools 
        : [{ name: getToolName(l.toolId || '') }]
      ).map(t => t.name.toLowerCase()).join(' ');
      const proj = (l.project || l.client || l.purpose || '').toLowerCase();
      
      if (!eng.includes(q) && !toolNames.includes(q) && !proj.includes(q)) {
        return false;
      }
    }
    
    if (loanDateFrom && new Date(l.dateOut) < new Date(loanDateFrom)) return false;
    if (loanDateTo && new Date(l.dateOut) > new Date(loanDateTo + 'T23:59:59')) return false;
    
    return true;
  }).sort((a, b) => new Date(b.dateOut).getTime() - new Date(a.dateOut).getTime());

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex-shrink-0 flex flex-col gap-3 mb-4">
        {/* Fila 1: Título + Botones */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h2 className="text-3xl font-bold dm-text tracking-tight">Gestión de Préstamos</h2>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={exportLoans} 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-xl hover:bg-slate-50 transition-colors text-sm font-bold shadow-sm"
            >
              <FileSpreadsheet size={16}/> Exportar
            </button>
            <button 
              onClick={() => setShowLoanModal(true)} 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm font-bold shadow-md shadow-blue-600/20"
            >
              <ArrowRightLeft size={16}/> Nueva Salida
            </button>
          </div>
        </div>
        
        {/* Fila 2: Filtros + Buscador */}
        <div className="flex flex-col sm:flex-row gap-2 flex-wrap max-w-full">
          {/* Tabs estado */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar max-w-full py-0.5">
            {(['ALL', 'active', 'returned'] as const).map(f => (
              <button 
                key={f} 
                onClick={() => setLoanFilter(f)} 
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  loanFilter === f 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {f === 'ALL' 
                  ? `Todos (${loans.length})` 
                  : f === 'active' 
                    ? `Activos (${loans.filter(l => !l.dateIn).length})` 
                    : `Devueltos (${loans.filter(l => !!l.dateIn).length})`}
              </button>
            ))}
          </div>
          
          {/* Buscador herramienta / custodio */}
          <div className="flex-1 relative min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
            <input
              type="text"
              placeholder="Buscar herramienta o custodio..."
              value={loanSearch}
              onChange={e => setLoanSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
            />
            {loanSearch && (
              <button 
                onClick={() => setLoanSearch('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13}/>
              </button>
            )}
          </div>
          
          {/* Filtros de fecha */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Desde</span>
            <input 
              type="date" 
              value={loanDateFrom} 
              onChange={e => setLoanDateFrom(e.target.value)} 
              className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Hasta</span>
            <input 
              type="date" 
              value={loanDateTo} 
              onChange={e => setLoanDateTo(e.target.value)} 
              className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
            />
          </div>
          {(loanDateFrom || loanDateTo) && (
            <button 
              onClick={() => { setLoanDateFrom(''); setLoanDateTo(''); }} 
              className="text-xs text-slate-500 hover:text-red-600 font-semibold px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-red-200 transition-colors whitespace-nowrap"
            >
              Limpiar fechas
            </button>
          )}
        </div>
      </div>

      <div className="dm-surface rounded-2xl border dm-border shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left text-sm relative table-auto min-w-[700px]">
            <thead className="sticky top-0 z-20 dm-surface2 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.08)]">
              <tr>
                <th className="px-4 py-3 font-bold dm-text3 text-[10px] uppercase tracking-widest whitespace-nowrap">Activos Involucrados</th>
                <th className="px-4 py-3 font-bold dm-text3 text-[10px] uppercase tracking-widest whitespace-nowrap">Custodio</th>
                <th className="px-4 py-3 font-bold dm-text3 text-[10px] uppercase tracking-widest whitespace-nowrap">Emisión</th>
                <th className="px-4 py-3 font-bold dm-text3 text-[10px] uppercase tracking-widest whitespace-nowrap">Recepción</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-widest text-right pr-6 whitespace-nowrap">Proceso</th>
              </tr>
            </thead>
            <tbody className="divide-y dm-divide">
              {filteredLoans.flatMap(l => {
                const toolList = l.tools && l.tools.length > 0 
                  ? l.tools 
                  : l.toolId 
                    ? [{ id: l.toolId, name: getToolName(l.toolId), serial: '' }] 
                    : [{ id: '', name: 'Varios', serial: '' }];
                const eng = getEngineerName(l.engineerId);
                const days = Math.ceil((new Date().getTime() - new Date(l.dateOut).getTime()) / 86400000);
                const dc = days > 14 
                  ? 'text-red-600 bg-red-50 border-red-200' 
                  : days > 7 
                    ? 'text-amber-600 bg-amber-50 border-amber-200' 
                    : 'text-emerald-600 bg-emerald-50 border-emerald-200';
                
                return toolList.map((t, idx) => (
                  <tr 
                    key={`${l.id}-${idx}`} 
                    className={`hover:bg-slate-50/80 transition-colors ${
                      idx > 0 ? 'border-t border-dashed border-slate-100' : ''
                    }`}
                  >
                    <td className="px-4 py-3 min-w-[180px]">
                      <div className="font-bold dm-text text-xs leading-tight">{t.name}</div>
                      {idx === 0 && (
                        <div className="text-[10px] dm-text3 mt-1 flex items-center gap-1 whitespace-nowrap">
                          <Building2 size={9}/> {l.project || l.client || l.purpose}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold dm-text2 text-xs whitespace-nowrap">
                      {idx === 0 ? eng : <span className="text-slate-500 text-[10px]">↳</span>}
                    </td>
                    <td className="px-4 py-3 dm-text3 font-mono text-xs whitespace-nowrap">
                      {idx === 0 ? new Date(l.dateOut).toLocaleDateString() : ''}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {idx === 0 ? (
                        l.dateIn ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="dm-text3 font-mono text-xs">
                              {new Date(l.dateIn).toLocaleDateString()}
                            </span>
                            {l.returnCondition && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded inline-block border ${
                                l.returnCondition === 'Con daños' 
                                  ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                  : l.returnCondition === 'Requiere revisión' 
                                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                              }`}>
                                {l.returnCondition}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wider animate-pulse">
                                En Terreno
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${dc}`}>
                                {days}d
                              </span>
                            </div>
                            {l.partialReturns && l.partialReturns.length > 0 && (
                              <div className="flex flex-col gap-1">
                                {l.partialReturns.map((pr, pi) => (
                                  <div key={pi} className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1.5">
                                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider mb-0.5">
                                      Devuelto parcial · {new Date(pr.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-[10px] font-semibold dm-text">
                                      {pr.tools.map(pt => pt.name).join(', ')}
                                    </p>
                                    {pr.returnNotes && (
                                      <p className="text-[9px] text-emerald-500 mt-0.5">{pr.returnNotes}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      ) : ''}
                    </td>
                    <td className="px-4 py-3 text-right pr-4 whitespace-nowrap">
                      {idx === 0 && (
                        <div className="flex items-center justify-end gap-1.5">
                          {!l.dateIn && (
                            <button 
                              onClick={() => handleOpenReturnModal(l)} 
                              className="text-[10px] font-bold dm-text2 dm-surface border dm-border px-2.5 py-1.5 rounded-md hover:bg-blue-500/10 hover:text-blue-500 transition-colors shadow-sm"
                            >
                              Recibir
                            </button>
                          )}
                          <button 
                            onClick={() => generateLoanPDF(l, eng)} 
                            className="inline-flex items-center gap-1 text-[10px] font-bold dm-text3 dm-surface border dm-border px-2.5 py-1.5 rounded-md hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-colors shadow-sm"
                          >
                            <Printer size={10}/> PDF
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ));
              })}
              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm font-medium text-slate-400">
                    {loans.length === 0 
                      ? 'El registro de operaciones está vacío.' 
                      : 'No hay resultados para el filtro aplicado.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
