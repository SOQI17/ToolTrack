import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, AlertOctagon, Calendar, History, 
  Search, X, Wrench, ShieldCheck, CheckCircle2, DollarSign
} from 'lucide-react';
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

interface CalibrationHistoryItem {
  id: string;
  toolId: string;
  tool: ToolItem;
  date: string;
  description: string;
  cost: number;
  technician: string;
  nextCalibrationDate?: string;
  certificateNumber?: string;
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
  const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'history'>('schedule');
  const [historySearch, setHistorySearch] = useState<string>('');
  const [historyDateFrom, setHistoryDateFrom] = useState<string>('');
  const [historyDateTo, setHistoryDateTo] = useState<string>('');

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

  const handleViewToolDetails = (t: ToolItem) => {
    setSelectedTool(t);
    setModalTab('maintenance');
    setShowDetailsModal(true);
  };

  // Construir historial completo de calibraciones a partir de todos los activos
  const allCalibrationHistory: CalibrationHistoryItem[] = [];

  tools.forEach(tool => {
    const datesRecorded = new Set<string>();

    if (tool.maintenanceHistory && tool.maintenanceHistory.length > 0) {
      tool.maintenanceHistory.forEach(m => {
        const isCal = m.isCalibration || m.description.toLowerCase().includes('calibrac') || tool.abcCategory === 'A';
        if (isCal) {
          datesRecorded.add(m.date);
          allCalibrationHistory.push({
            id: m.id,
            toolId: tool.id,
            tool,
            date: m.date,
            description: m.description || 'Calibración registrada',
            cost: m.cost || 0,
            technician: m.technician || 'Laboratorio / Técnico',
            nextCalibrationDate: m.nextCalibrationDate || tool.nextCalibration,
            certificateNumber: m.certificateNumber
          });
        }
      });
    }

    // Si el activo tiene lastCalibration pero no estaba registrado en maintenanceHistory
    if (tool.lastCalibration && !datesRecorded.has(tool.lastCalibration)) {
      allCalibrationHistory.push({
        id: `${tool.id}_lastcal`,
        toolId: tool.id,
        tool,
        date: tool.lastCalibration,
        description: 'Calibración inicial / Certificación vigente',
        cost: 0,
        technician: 'Laboratorio Autorizado',
        nextCalibrationDate: tool.nextCalibration
      });
    }
  });

  // Ordenar historial de más reciente a más antiguo
  allCalibrationHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filtrado de historial
  const filteredHistory = allCalibrationHistory.filter(item => {
    const q = historySearch.toLowerCase().trim();
    if (q) {
      const matchName = item.tool.name.toLowerCase().includes(q);
      const matchSerial = item.tool.serial.toLowerCase().includes(q);
      const matchTag = item.tool.orimec ? item.tool.orimec.toLowerCase().includes(q) : false;
      const matchTech = item.technician.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchName && !matchSerial && !matchTag && !matchTech && !matchDesc) return false;
    }

    if (historyDateFrom) {
      const dFrom = new Date(historyDateFrom);
      const itemDate = new Date(item.date);
      if (itemDate < dFrom) return false;
    }

    if (historyDateTo) {
      const dTo = new Date(historyDateTo);
      dTo.setHours(23, 59, 59, 999);
      const itemDate = new Date(item.date);
      if (itemDate > dTo) return false;
    }

    return true;
  });

  // Métricas de calibraciones
  const totalCost = filteredHistory.reduce((acc, h) => acc + (h.cost || 0), 0);
  const uniqueToolsCalibrated = new Set(filteredHistory.map(h => h.toolId)).size;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Cabecera Principal */}
      <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold dm-text tracking-tight">Calibraciones</h2>
          <p className="text-xs dm-text3 mt-1">Control metrológico e historial técnico de herramientas Clase A</p>
        </div>

        {/* Sub-Pestañas de Navegación */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'schedule'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar size={14}/> Programación y Vencimientos
            {overdue.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'history'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History size={14}/> Historial de Calibraciones ({allCalibrationHistory.length})
          </button>
        </div>
      </div>

      {/* CONTENIDO 1: PROGRAMACIÓN Y VENCIMIENTOS */}
      {activeSubTab === 'schedule' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-6">
          {/* Navegador de Mes */}
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Calendario de Vencimientos</h3>
              <p className="text-xs text-slate-400 mt-0.5">Explora las fechas límite de calibración por mes</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCalendarMonth(m => {
                  const d = new Date(m.year, m.month - 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })} 
                className="p-2 dm-surface border dm-border rounded-xl hover:bg-blue-50 transition-colors shadow-sm text-slate-700"
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
                className="p-2 dm-surface border dm-border rounded-xl hover:bg-blue-50 transition-colors shadow-sm text-slate-700"
              >
                <ChevronRight size={16}/>
              </button>
            </div>
          </div>

          {/* Vencidas */}
          {overdue.length > 0 && (
            <div className="bg-red-500/10 border border-red-400/20 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <AlertOctagon size={13}/> Vencidas ({overdue.length})
              </h3>
              <div className="space-y-2">
                {overdue.map(t => (
                  <div key={t.id} className="flex items-center gap-3 dm-surface border dm-border rounded-xl px-4 py-3 bg-white">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold dm-text truncate">{t.name}</p>
                      <p className="text-[10px] dm-text3 font-mono">SN: {t.serial} {t.orimec ? `· Tag: ${t.orimec}` : ''}</p>
                    </div>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg shrink-0">
                      Venció: {new Date(t.nextCalibration!).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={() => handleRegisterCalibration(t)} 
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition-all shrink-0"
                    >
                      Registrar Calibración →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Este Mes */}
          <div className="dm-surface border dm-border rounded-2xl p-5 shadow-sm bg-white">
            <h3 className="text-xs font-bold dm-text3 uppercase tracking-widest mb-4">
              {inMonth.length === 0 ? 'Sin calibraciones este mes' : `Este mes (${inMonth.length})`}
            </h3>
            {inMonth.length === 0 ? (
              <p className="text-sm dm-text3 text-center py-8">No hay calibraciones programadas para este período.</p>
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
                            : 'dm-border dm-surface bg-slate-50/50'
                      }`}
                    >
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex flex-col items-center justify-center shrink-0 border border-slate-200">
                        <span className="text-[9px] font-bold text-slate-500 leading-none">
                          {d.toLocaleString('es', { month: 'short' }).toUpperCase()}
                        </span>
                        <span className="text-sm font-black text-slate-800">{d.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold dm-text truncate">{t.name}</p>
                        <p className="text-[10px] dm-text3 font-mono">SN: {t.serial} {t.orimec ? `· Tag: ${t.orimec}` : ''}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border shrink-0 ${
                        days < 0 
                          ? 'text-red-600 bg-red-50 border-red-200' 
                          : days === 0 
                            ? 'text-amber-700 bg-amber-50 border-amber-200' 
                            : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      }`}>
                        {days < 0 ? `${Math.abs(days)}d vencido` : days === 0 ? 'Hoy' : `${days}d restantes`}
                      </span>
                      <button 
                        onClick={() => handleRegisterCalibration(t)} 
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition-all shrink-0"
                      >
                        Registrar →
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Próximos 30 días */}
          {upcoming.length > 0 && (
            <div className="dm-surface2 border dm-border rounded-2xl p-5 bg-slate-50">
              <h3 className="text-xs font-bold dm-text3 uppercase tracking-widest mb-3">
                Próximos 30 días ({upcoming.length})
              </h3>
              <div className="space-y-2">
                {upcoming.map(t => (
                  <div key={t.id} className="flex items-center gap-3 dm-surface border dm-border rounded-xl px-4 py-2.5 bg-white">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold dm-text truncate">{t.name}</p>
                      <p className="text-[10px] dm-text3 font-mono">SN: {t.serial}</p>
                    </div>
                    <span className="text-[10px] dm-text font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {new Date(t.nextCalibration!).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO 2: HISTORIAL DE CALIBRACIONES */}
      {activeSubTab === 'history' && (
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-5 pb-6">
          {/* Métricas del Historial */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <CheckCircle2 size={22}/>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Calibraciones</p>
                <p className="text-xl font-black text-slate-800">{filteredHistory.length}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Wrench size={22}/>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Equipos Calibrados</p>
                <p className="text-xl font-black text-slate-800">{uniqueToolsCalibrated}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <DollarSign size={22}/>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inversión Registrada</p>
                <p className="text-xl font-black text-slate-800">${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          {/* Barra de Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input
                type="text"
                placeholder="Buscar por equipo, serie, tag o técnico..."
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-blue-500 font-medium"
              />
              {historySearch && (
                <button onClick={() => setHistorySearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={13}/>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Desde</span>
                <input
                  type="date"
                  value={historyDateFrom}
                  onChange={e => setHistoryDateFrom(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hasta</span>
                <input
                  type="date"
                  value={historyDateTo}
                  onChange={e => setHistoryDateTo(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-blue-500 font-mono"
                />
              </div>
              {(historySearch || historyDateFrom || historyDateTo) && (
                <button
                  onClick={() => {
                    setHistorySearch('');
                    setHistoryDateFrom('');
                    setHistoryDateTo('');
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-red-200 bg-white transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Tabla de Historial */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm relative">
              <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-md shadow-[0_1px_0_0_#e2e8f0] text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <tr>
                  <th className="px-5 py-3.5 whitespace-nowrap min-w-[220px]">Herramienta / Equipo</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Fecha Calibración</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Próxima Vigencia</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Técnico / Laboratorio</th>
                  <th className="px-4 py-3.5 whitespace-nowrap">Costo</th>
                  <th className="px-4 py-3.5 whitespace-nowrap min-w-[200px]">Detalle / Certificado</th>
                  <th className="px-5 py-3.5 text-right pr-6 whitespace-nowrap">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y dm-divide">
                {filteredHistory.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 min-w-[220px]">
                      <div className="font-bold text-slate-800 text-[13px] leading-tight flex items-center gap-1.5">
                        <span className="text-[9px] font-black bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                          {item.tool.abcCategory || 'A'}
                        </span>
                        {item.tool.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        SN: {item.tool.serial} {item.tool.orimec ? `· Tag: ${item.tool.orimec}` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono text-slate-900 text-xs font-semibold">
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block mt-0.5">
                        Completada
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {item.nextCalibrationDate ? (
                        <div className="font-mono text-slate-700 text-xs">
                          {new Date(item.nextCalibrationDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-mono">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-xs font-semibold text-slate-700">
                        {item.technician || 'Laboratorio Externo'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-bold text-slate-800">
                      {item.cost > 0 ? `$${item.cost.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 min-w-[200px]">
                      <p className="line-clamp-2">{item.description}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right pr-6 whitespace-nowrap">
                      <button
                        onClick={() => handleViewToolDetails(item.tool)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all shadow-sm"
                        title="Ver ficha técnica y registro de mantenimientos"
                      >
                        <ShieldCheck size={13}/> Ver Activo
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium bg-slate-50/50">
                      No se encontraron registros en el historial de calibraciones.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

