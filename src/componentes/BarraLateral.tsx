import React from 'react';
import { 
  Wrench, LayoutDashboard, ClipboardList, ArrowRightLeft, 
  Package, Users, Calendar, FileBarChart2, LogOut, Sun, Moon,
  Inbox, Clock
} from 'lucide-react';
import type { UserRole } from '../tipos';

interface BarraLateralProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  alertsCount: number;
  pendingRequestsCount?: number;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser: string;
  userRole: UserRole;
  logout: () => void;
}

export const BarraLateral: React.FC<BarraLateralProps> = ({
  activeTab,
  setActiveTab,
  alertsCount,
  pendingRequestsCount = 0,
  darkMode,
  setDarkMode,
  currentUser,
  userRole,
  logout
}) => {
  const isAdmin = userRole === 'admin';
  const isBodeguero = userRole === 'bodeguero';
  const isIngeniero = userRole === 'ingeniero';

  const menuItems = isIngeniero
    ? [
        { id: 'inventory', icon: ClipboardList, label: 'Activos Fijos' },
        { id: 'my_requests', icon: Clock, label: 'Mis Solicitudes' }
      ]
    : [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Panel Operativo' },
        { id: 'inventory', icon: ClipboardList, label: 'Activos Fijos' },
        { id: 'loans', icon: ArrowRightLeft, label: 'Préstamos' },
        { id: 'requests', icon: Inbox, label: 'Solicitudes' },
        { id: 'consumables', icon: Package, label: 'Consumibles' },
        { id: 'engineers', icon: Users, label: 'Personal Técnico' },
        { id: 'calendar', icon: Calendar, label: 'Calibraciones' },
        { id: 'reports', icon: FileBarChart2, label: 'Reportes' }
      ];

  const roleLabel = isAdmin ? 'Administrador' : isBodeguero ? 'Bodeguero' : 'Ingeniero';
  const roleColor = isAdmin 
    ? 'text-blue-400' 
    : isBodeguero 
      ? 'text-amber-400' 
      : 'text-emerald-400';

  const dotColor = isAdmin ? 'bg-blue-400' : isBodeguero ? 'bg-amber-400' : 'bg-emerald-400';

  return (
    <aside className="w-full md:w-[260px] h-full bg-[#0B1528] text-slate-300 flex flex-col shrink-0 border-r border-slate-800 z-20 shadow-2xl shadow-slate-900/20">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/60 shrink-0">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-xl shadow-inner">
          <Wrench size={20} className="text-white"/>
        </div>
        <div>
          <span className="font-bold text-white tracking-tight leading-none block">ToolTrack</span>
          <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">ORIMEC C.A.</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id)} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold relative overflow-hidden ${
              activeTab === item.id ? 'text-white bg-blue-600/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {activeTab === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full"></div>
            )}
            <item.icon size={18} className={activeTab === item.id ? 'text-blue-500' : 'text-slate-500'} />
            <span>{item.label}</span>
            {item.id === 'dashboard' && alertsCount > 0 && (
              <span className="ml-auto bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/20">
                {alertsCount}
              </span>
            )}
            {item.id === 'requests' && pendingRequestsCount > 0 && (
              <span className="ml-auto bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/20 animate-pulse">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 bg-[#070D1A] shrink-0 border-t border-slate-800/60 space-y-2">
        {/* Toggle Modo Oscuro */}
        <button 
          onClick={() => setDarkMode(d => !d)} 
          className="w-full flex items-center justify-between gap-2 text-[10px] font-semibold text-slate-500 hover:text-slate-300 transition-colors bg-slate-800/40 hover:bg-slate-800 px-3 py-2.5 rounded-xl border border-slate-700/30"
        >
          <div className="flex items-center gap-2">
            {darkMode ? <Sun size={12} className="text-amber-400"/> : <Moon size={12} className="text-slate-400"/>}
            <span className="uppercase tracking-wider">{darkMode ? 'Modo oscuro activo' : 'Modo claro activo'}</span>
          </div>
          <div className={`w-9 h-5 rounded-full transition-all flex items-center px-0.5 ${darkMode ? 'bg-blue-600' : 'bg-slate-600/60'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${darkMode ? 'translate-x-4' : ''}`}/>
          </div>
        </button>

        {/* Información del usuario */}
        <div className="flex items-center gap-3 px-1 py-1">
          <div className="w-8 h-8 rounded-full bg-[#1a3a6b] border border-blue-900/60 flex justify-center items-center text-white text-xs font-bold shrink-0">
            {currentUser.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate leading-tight">{currentUser}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`}/>
              <p className={`text-[9px] uppercase tracking-wider font-semibold ${roleColor}`}>
                {roleLabel}
              </p>
            </div>
          </div>
          <button 
            onClick={logout} 
            title="Cerrar sesión" 
            className="text-slate-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <LogOut size={14}/>
          </button>
        </div>
        <p className="text-[9px] text-slate-700 text-center tracking-widest">N · B · Esc</p>
      </div>
    </aside>
  );
};
