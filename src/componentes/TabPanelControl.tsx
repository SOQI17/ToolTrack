import React from 'react';
import { 
  Wrench, Search, Bell, AlertOctagon, ArrowRightLeft, CheckCircle, Package 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import type { ToolItem, Loan, Engineer } from '../tipos';

interface TabPanelControlProps {
  tools: ToolItem[];
  loans: Loan[];
  engineers: Engineer[];
  alerts: any[];
  setAlertModal: (alert: any) => void;
  showGlobalSearch: boolean;
  setShowGlobalSearch: React.Dispatch<React.SetStateAction<boolean>>;
  globalSearch: string;
  setGlobalSearch: (val: string) => void;
  getEngineerName: (id: string) => string;
  getToolName: (id: string) => string;
  setSelectedTool: (tool: ToolItem) => void;
  setModalTab: (tab: any) => void;
  setShowDetailsModal: (show: boolean) => void;
  setActiveTab: (tab: any) => void;
}

export const TabPanelControl: React.FC<TabPanelControlProps> = ({
  tools,
  loans,
  engineers,
  alerts,
  setAlertModal,
  showGlobalSearch,
  setShowGlobalSearch,
  globalSearch,
  setGlobalSearch,
  getEngineerName,
  getToolName,
  setSelectedTool,
  setModalTab,
  setShowDetailsModal,
  setActiveTab
}) => {
  const statusData = [
    { name: 'Disponibles', value: tools.filter(t => t.status === 'available').length, color: '#10b981' },
    { name: 'Prestados', value: tools.filter(t => t.status === 'in-use').length, color: '#2563EB' },
    { name: 'Mantenimiento', value: tools.filter(t => t.status === 'maintenance').length, color: '#f59e0b' },
    { name: 'Dañados', value: tools.filter(t => t.status === 'broken').length, color: '#ef4444' }
  ].filter(i => i.value > 0);

  const categoryCount: { [k: string]: number } = {};
  tools.forEach(t => {
    categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
  });
  const categoryData = Object.keys(categoryCount).map(c => ({
    name: c,
    cantidad: categoryCount[c]
  }));

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight dm-text">Centro de Control</h1>
          <p className="text-sm mt-1 font-medium dm-text2">Resumen en tiempo real del estado de la bodega.</p>
          <p className="text-[10px] text-slate-400 mt-1 hidden md:block">
            N: nuevo préstamo · B: búsqueda global · Esc: cerrar
          </p>
        </div>
        <div className="relative shrink-0">
          <button 
            onClick={() => { setShowGlobalSearch(s => !s); setGlobalSearch(''); }} 
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-bold shadow-sm transition-all"
          >
            <Search size={15}/> Búsqueda global <span className="text-[10px] text-slate-400 font-mono ml-1">B</span>
          </button>
          
          {showGlobalSearch && (
            <div className="absolute right-0 top-12 bg-white border border-slate-200 rounded-2xl shadow-2xl w-96 z-30 overflow-hidden">
              <div className="p-3 border-b border-slate-100">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                  <input 
                    autoFocus 
                    placeholder="Buscar herramientas, ingenieros, préstamos..." 
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 transition-all" 
                    value={globalSearch} 
                    onChange={e => setGlobalSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {globalSearch.length > 1 ? (() => {
                  const q = globalSearch.toLowerCase();
                  const tr = tools.filter(t => t.name.toLowerCase().includes(q) || t.serial.toLowerCase().includes(q));
                  const er = engineers.filter(e => e.name.toLowerCase().includes(q));
                  const lr = loans.filter(l => !l.dateIn && (getEngineerName(l.engineerId).toLowerCase().includes(q) || l.tools?.some(t => t.name.toLowerCase().includes(q))));
                  
                  if (!tr.length && !er.length && !lr.length) {
                    return <p className="py-8 text-center text-xs text-slate-400">Sin resultados para "{globalSearch}"</p>;
                  }
                  
                  return (
                    <div className="divide-y divide-slate-50">
                      {tr.slice(0,4).map(t => (
                        <button 
                          key={t.id} 
                          onClick={() => { 
                            setShowGlobalSearch(false); 
                            setGlobalSearch(''); 
                            setSelectedTool(t); 
                            setModalTab('general'); 
                            setShowDetailsModal(true); 
                          }} 
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-colors"
                        >
                          <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                            <Wrench size={13} className="text-slate-500"/>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{t.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">SN: {t.serial}</p>
                          </div>
                          <span className="ml-auto text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Activo</span>
                        </button>
                      ))}
                      {er.slice(0,3).map(e => (
                        <button 
                          key={e.id} 
                          onClick={() => { 
                            setShowGlobalSearch(false); 
                            setGlobalSearch(''); 
                            setActiveTab('engineers');
                          }} 
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-colors"
                        >
                          <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 text-xs font-black text-blue-700">
                            {e.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{e.name}</p>
                            <p className="text-[10px] text-slate-400">{e.department}</p>
                          </div>
                          <span className="ml-auto text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Personal</span>
                        </button>
                      ))}
                      {lr.slice(0,3).map(l => (
                        <button 
                          key={l.id} 
                          onClick={() => { 
                            setShowGlobalSearch(false); 
                            setGlobalSearch(''); 
                            setActiveTab('loans');
                          }} 
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition-colors"
                        >
                          <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                            <ArrowRightLeft size={13} className="text-amber-600"/>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{getEngineerName(l.engineerId)}</p>
                            <p className="text-[10px] text-slate-400">{l.tools?.map(t=>t.name).join(', ')}</p>
                          </div>
                          <span className="ml-auto text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded">Activo</span>
                        </button>
                      ))}
                    </div>
                  );
                })() : <p className="py-8 text-center text-xs text-slate-400">Escribe al menos 2 caracteres</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="bg-red-500/10 border border-red-400/20 p-5 rounded-2xl shadow-sm">
          <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Bell size={16} className="animate-pulse"/> Requieren Atención ({alerts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map((a, i) => {
               const tl = a.type === 'calibration' ? 'Calibración' : a.type === 'loan' ? 'Préstamo' : 'Stock';
               const tc = a.type === 'calibration' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : a.type === 'loan' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20';
               return (
                <button 
                   key={i} 
                   onClick={() => setAlertModal(a)} 
                   className="flex items-start gap-2.5 dm-surface px-4 py-3 rounded-xl border dm-border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] text-left w-full hover:shadow-md hover:bg-red-500/5 transition-all group cursor-pointer"
                >
                   <AlertOctagon size={16} className="text-red-500 mt-0.5 shrink-0 group-hover:scale-110 transition-transform"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs dm-text font-medium leading-snug">{a.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${tc}`}>{tl}</span>
                      <span className="text-[9px] text-slate-400 group-hover:text-blue-500 transition-colors">Ver detalle →</span>
                    </div>
                  </div>
                </button>
               );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Total Registrados', value: tools.length, icon: Wrench, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'En Préstamo', value: tools.filter(t => t.status === 'in-use').length, icon: ArrowRightLeft, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Stock Disponible', value: tools.filter(t => t.status === 'available').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Alerta Consumos', value: alerts.filter(a => a.type === 'stock').length, icon: Package, color: 'text-red-600', bg: 'bg-red-50' }
        ].map((stat, i) => (
          <div key={i} className="dm-surface p-6 rounded-2xl border dm-border shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start">
              <p className="dm-text2 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={18}/>
              </div>
            </div>
            <p className="text-3xl font-black dm-text tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="dm-surface p-6 rounded-2xl border dm-border shadow-sm min-h-[340px]">
          <h3 className="text-sm font-bold dm-text mb-6 uppercase tracking-wider">Estado Operativo</h3>
          {tools.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie 
                  data={statusData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={70} 
                  outerRadius={90} 
                  paddingAngle={3} 
                  dataKey="value" 
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{
                    borderRadius:'12px', 
                    border:'1px solid var(--dm-border)', 
                    backgroundColor: 'var(--dm-surface)',
                    color: 'var(--dm-text)',
                    boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                    fontSize:'12px', 
                    fontWeight:'500'
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize:'12px', fontWeight:'600', paddingTop:'20px', color:'var(--dm-text2)' }}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-sm text-center mt-10">Sin datos.</p>
          )}
        </div>
        
        <div className="dm-surface p-6 rounded-2xl border dm-border shadow-sm min-h-[340px]">
          <h3 className="text-sm font-bold dm-text mb-6 uppercase tracking-wider">Clasificación Activos</h3>
          {tools.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--dm-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--dm-text3)', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--dm-text3)', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: 'var(--dm-surface2)' }} 
                  contentStyle={{
                    borderRadius:'12px', 
                    border:'1px solid var(--dm-border)', 
                    backgroundColor: 'var(--dm-surface)',
                    color: 'var(--dm-text)',
                    fontSize:'12px', 
                    fontWeight:'500', 
                    boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="cantidad" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-sm text-center mt-10">Sin datos.</p>
          )}
        </div>
      </div>
    </div>
  );
};
