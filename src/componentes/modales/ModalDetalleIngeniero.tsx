import React, { useState } from 'react';
import { X, Users, CheckCircle, Edit, Save } from 'lucide-react';
import type { Engineer, Loan, ConsumableLog, UserRole } from '../../tipos';

interface ModalDetalleIngenieroProps {
  selectedEngineer: Engineer;
  setShowEngineerDetailsModal: (show: boolean) => void;
  engineerModalTab: 'loans' | 'consumables';
  setEngineerModalTab: (tab: any) => void;
  getEngineerLoans: (id: string) => Loan[];
  getEngineerConsumables: (id: string) => ConsumableLog[];
  appZoom: number;
  email?: string;
  createdAt?: string;
  lastLogin?: string;
  userRole?: UserRole;
  isAdmin?: boolean;
  onUpdateEngineer?: (id: string, updatedData: Partial<Engineer>) => Promise<void>;
  onUpdateUserRole?: (uid: string, role: UserRole) => Promise<void>;
}

export const ModalDetalleIngeniero: React.FC<ModalDetalleIngenieroProps> = ({
  selectedEngineer,
  setShowEngineerDetailsModal,
  engineerModalTab,
  setEngineerModalTab,
  getEngineerLoans,
  getEngineerConsumables,
  appZoom,
  email,
  createdAt,
  lastLogin,
  userRole,
  isAdmin,
  onUpdateEngineer,
  onUpdateUserRole
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(selectedEngineer.name);
  const [editDepartment, setEditDepartment] = useState<string>(selectedEngineer.department);
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>(selectedEngineer.status || 'active');
  const [editRole, setEditRole] = useState<UserRole>(userRole || 'ingeniero');
  const [saving, setSaving] = useState<boolean>(false);

  const handleSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      if (onUpdateEngineer) {
        await onUpdateEngineer(selectedEngineer.id, {
          name: editName.trim(),
          department: editDepartment,
          status: editStatus
        });
      }
      if (email && onUpdateUserRole && userRole !== editRole) {
        await onUpdateUserRole(selectedEngineer.id, editRole);
      }
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" 
      style={{ zoom: 1 / appZoom } as React.CSSProperties}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="p-8 border-b flex justify-between items-start bg-slate-900 text-white relative overflow-hidden shrink-0">
          <div className="absolute right-0 top-0 opacity-5 pointer-events-none translate-x-1/4 -translate-y-1/4">
            <Users size={300}/>
          </div>
          
          <div className="flex items-center gap-6 relative z-10 flex-1">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl border border-blue-400/30 flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-900/50 shrink-0">
              {editName ? editName.charAt(0) : selectedEngineer.name.charAt(0)}
            </div>
            
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Nombre Completo *
                  </label>
                  <input 
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Departamento / Área *
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white outline-none focus:border-blue-500 transition-all"
                    value={editDepartment}
                    onChange={e => setEditDepartment(e.target.value)}
                  >
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Operaciones">Operaciones</option>
                    <option value="Instrumentación">Instrumentación</option>
                    <option value="Telecomunicaciones">Telecomunicaciones</option>
                    <option value="Seguridad y Control">Seguridad y Control</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Estado Laboral *
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white outline-none focus:border-blue-500 transition-all"
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as 'active' | 'inactive')}
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo (Ocultar/Blur)</option>
                  </select>
                </div>
                {email ? (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Rol de Acceso al Sistema *
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white outline-none focus:border-blue-500 transition-all"
                      value={editRole}
                      onChange={e => setEditRole(e.target.value as UserRole)}
                    >
                      <option value="admin">Administrador</option>
                      <option value="bodeguero">Bodeguero</option>
                      <option value="ingeniero">Ingeniero</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex items-end pb-2">
                    <span className="text-xs text-slate-500 italic">Técnico sin cuenta de acceso al sistema</span>
                  </div>
                )}
                
                <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                  <button 
                    onClick={() => setIsEditing(false)} 
                    disabled={saving}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all border border-slate-700"
                  >
                    Descartar
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={saving || !editName.trim()}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-900/50 flex items-center gap-1.5"
                  >
                    <Save size={13}/> Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-blue-400 font-bold tracking-widest uppercase text-[10px] mb-1.5">
                  Expediente de Personal
                </p>
                <h2 className="text-3xl font-black tracking-tight mb-2 leading-none">
                  {selectedEngineer.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-slate-300 font-semibold bg-white/10 px-3 py-1 rounded-lg text-xs border border-white/5">
                    {selectedEngineer.department}
                  </span>
                  
                  {selectedEngineer.status === 'inactive' && (
                    <span className="text-red-300 font-semibold bg-red-500/10 px-3 py-1 rounded-lg text-xs border border-red-500/10 uppercase tracking-wider">
                      Inactivo
                    </span>
                  )}
                  
                  {email ? (
                    <>
                      <span className="text-blue-300 font-semibold bg-blue-500/10 px-3 py-1 rounded-lg text-xs border border-blue-500/10">
                        {email} ({userRole === 'admin' ? 'Administrador' : userRole === 'bodeguero' ? 'Bodeguero' : 'Ingeniero'})
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400 font-semibold bg-white/5 px-3 py-1 rounded-lg text-xs border border-white/5">
                      Sin cuenta de acceso
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col gap-1 mt-4 text-slate-400 text-[11px] font-mono">
                  {createdAt && (
                    <span>
                      📅 Registro del perfil: {new Date(createdAt).toLocaleDateString()} {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {email && (
                    <span>
                      🔑 Último acceso al sistema: {lastLogin ? `${new Date(lastLogin).toLocaleDateString()} ${new Date(lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Nunca'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 relative z-10">
            {isAdmin && !isEditing && (
              <button 
                onClick={() => {
                  setEditName(selectedEngineer.name);
                  setEditDepartment(selectedEngineer.department);
                  setEditStatus(selectedEngineer.status || 'active');
                  setEditRole(userRole || 'ingeniero');
                  setIsEditing(true);
                }} 
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all border border-white/10 hover:border-white/20 mr-2 flex items-center gap-1.5 shadow-sm"
              >
                <Edit size={13}/> Editar
              </button>
            )}
            <button 
              onClick={() => setShowEngineerDetailsModal(false)} 
              className="bg-white/5 hover:bg-white/20 p-2 rounded-full transition-colors border border-transparent hover:border-white/10"
            >
              <X size={20}/>
            </button>
          </div>
        </div>
        
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-8 gap-8 shadow-sm z-10 relative shrink-0 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setEngineerModalTab('loans')} 
            className={`py-4 text-sm font-black border-b-2 transition-colors outline-none tracking-wide whitespace-nowrap ${
              engineerModalTab === 'loans' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            HISTORIAL DE EQUIPOS
          </button>
          <button 
            onClick={() => setEngineerModalTab('consumables')} 
            className={`py-4 text-sm font-black border-b-2 transition-colors outline-none tracking-wide whitespace-nowrap ${
              engineerModalTab === 'consumables' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            MATERIAL ENTREGADO
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden bg-[#fafafa] flex flex-col min-h-0">
          {engineerModalTab === 'loans' && (
            <div className="overflow-auto custom-scrollbar flex-1 p-6 md:p-8">
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm relative table-auto">
                  <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-md shadow-[0_1px_0_0_#e2e8f0] text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-3 bg-transparent whitespace-nowrap">Equipos Asignados</th>
                      <th className="px-6 py-3 bg-transparent whitespace-nowrap">Proyecto / Destino</th>
                      <th className="px-6 py-3 bg-transparent whitespace-nowrap">Fechas</th>
                      <th className="px-6 py-3 text-center bg-transparent whitespace-nowrap">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dm-divide">
                    {getEngineerLoans(selectedEngineer.id).map(l => (
                      <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3 font-bold text-slate-800 text-[13px] min-w-[200px] whitespace-normal leading-tight">
                          {l.tools ? l.tools.map(t => t.name).join(', ') : 'Varios'}
                        </td>
                        <td className="px-6 py-3 text-slate-600 font-medium text-xs whitespace-nowrap">
                          {l.project || l.purpose}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="font-mono text-slate-900 text-xs font-semibold">
                            {new Date(l.dateOut).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            ➔ {l.dateIn ? new Date(l.dateIn).toLocaleDateString() : 'Pendiente'}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-center whitespace-nowrap">
                          {l.dateIn ? (
                            <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                              <CheckCircle size={12}/> Cerrado
                            </span>
                          ) : (
                            <span className="inline-block text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm animate-pulse">
                              Activo
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {getEngineerLoans(selectedEngineer.id).length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400 font-medium bg-slate-50/50">
                          El expediente está limpio.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {engineerModalTab === 'consumables' && (
            <div className="overflow-auto custom-scrollbar flex-1 p-6 md:p-8">
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm relative table-auto">
                  <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-md shadow-[0_1px_0_0_#e2e8f0] text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-3 bg-transparent whitespace-nowrap">Fecha de Retiro</th>
                      <th className="px-6 py-3 bg-transparent whitespace-nowrap">Insumo</th>
                      <th className="px-6 py-3 text-right pr-6 bg-transparent whitespace-nowrap">Volumen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dm-divide">
                    {getEngineerConsumables(selectedEngineer.id).map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="font-mono text-slate-900 text-xs font-semibold">
                            {new Date(log.date).toLocaleDateString()}
                          </span>{' '}
                          <span className="text-[10px] text-slate-400 ml-1 font-mono">
                            {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-bold text-slate-800 text-[13px] whitespace-normal min-w-[200px]">
                          {log.consumableName}
                        </td>
                        <td className="px-6 py-3 text-right pr-6 font-black text-blue-600 text-base whitespace-nowrap">
                          {log.quantity}
                        </td>
                      </tr>
                    ))}
                    {getEngineerConsumables(selectedEngineer.id).length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-slate-400 font-medium bg-slate-50/50">
                          No hay retiros registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
