import React from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import type { Engineer } from '../tipos';

interface TabPersonalProps {
  engineers: Engineer[];
  setShowEngineerModal: (show: boolean) => void;
  handleOpenEngineerDetails: (eng: Engineer) => void;
  handleDeleteEngineer: (id: string) => void;
}

export const TabPersonal: React.FC<TabPersonalProps> = ({
  engineers,
  setShowEngineerModal,
  handleOpenEngineerDetails,
  handleDeleteEngineer
}) => {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold dm-text tracking-tight">Equipo Técnico</h2>
        </div>
        <button 
          onClick={() => setShowEngineerModal(true)} 
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm font-bold shadow-md shadow-blue-600/20 w-full md:w-auto"
        >
          <UserPlus size={16}/> Nuevo Perfil
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {engineers.map(e => (
            <div 
              key={e.id} 
              onClick={() => handleOpenEngineerDetails(e)} 
              className="dm-surface p-5 rounded-2xl shadow-sm border dm-border relative group cursor-pointer hover:border-blue-400 hover:shadow-md transition-all flex flex-col items-center text-center"
            >
              <button 
                onClick={(ev) => {
                  ev.stopPropagation(); 
                  handleDeleteEngineer(e.id);
                }} 
                className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5"
              >
                <Trash2 size={16}/>
              </button>
              
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500/10 to-blue-600/20 border dm-border flex items-center justify-center dm-text font-black text-2xl mb-4 shadow-sm group-hover:scale-105 transition-transform">
                {e.name.charAt(0)}
              </div>
              
              <div className="w-full">
                <p className="font-bold dm-text text-[15px] truncate">{e.name}</p>
                <p className="text-[10px] font-bold dm-text3 uppercase tracking-widest mt-1 dm-surface2 px-2 py-0.5 rounded-md border dm-border inline-block">
                  {e.department}
                </p>
              </div>
            </div>
          ))}
          {engineers.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
              No hay personal registrado en el sistema.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
