import React, { useState } from 'react';
import { 
  X, Users, CheckCircle, Edit, Save, GitMerge, Plus, 
  Search, ShieldCheck, CornerDownLeft
} from 'lucide-react';
import type { Engineer, Loan, ConsumableLog, UserRole, ToolItem } from '../../tipos';

interface ModalDetalleIngenieroProps {
  selectedEngineer: Engineer;
  setShowEngineerDetailsModal: (show: boolean) => void;
  engineerModalTab: 'loans' | 'assigned' | 'consumables';
  setEngineerModalTab: (tab: any) => void;
  getEngineerLoans: (id: string) => Loan[];
  getEngineerConsumables: (id: string) => ConsumableLog[];
  appZoom: number;
  email?: string;
  createdAt?: string;
  lastLogin?: string;
  userRole?: UserRole;
  systemUserId?: string;
  systemUsers?: UserItem[];
  isAdmin?: boolean;
  engineers?: Engineer[];
  loans?: Loan[];
  tools?: ToolItem[];
  onUpdateEngineer?: (id: string, updatedData: Partial<Engineer>) => Promise<void>;
  onUpdateUserRole?: (uid: string, role: UserRole) => Promise<void>;
  onMergeEngineers?: (targetId: string, sourceId: string) => Promise<void>;
  onAssignPersonalTools?: (engineerId: string, toolsToAssign: ToolItem[]) => Promise<void>;
  onUnassignPersonalTool?: (loan: Loan) => Promise<void>;
  onLinkUserAccount?: (engineerId: string, userUid: string) => Promise<void>;
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
  systemUserId,
  systemUsers = [],
  isAdmin,
  engineers = [],
  loans = [],
  tools = [],
  onUpdateEngineer,
  onUpdateUserRole,
  onMergeEngineers,
  onAssignPersonalTools,
  onUnassignPersonalTool,
  onLinkUserAccount
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(selectedEngineer.name);
  const [editDepartment, setEditDepartment] = useState<string>(selectedEngineer.department);
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>(selectedEngineer.status || 'active');
  const [editRole, setEditRole] = useState<UserRole>(userRole || 'ingeniero');
  const [selectedUserUidToLink, setSelectedUserUidToLink] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Modal de Fusión
  const [showMergeModal, setShowMergeModal] = useState<boolean>(false);
  const [mergeTargetId, setMergeTargetId] = useState<string>('');

  // Modal de Asignación de Herramientas Personales
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [assignSearch, setAssignSearch] = useState<string>('');
  const [selectedToolsToAssign, setSelectedToolsToAssign] = useState<ToolItem[]>([]);

  // Préstamos regulares vs Asignaciones personales
  const allEngineerLoans = getEngineerLoans(selectedEngineer.id);
  const regularLoans = allEngineerLoans.filter(l => !l.isAssignment && l.purpose !== 'Asignación Personal');
  const assignedLoans = allEngineerLoans.filter(l => (l.isAssignment || l.purpose === 'Asignación Personal') && !l.dateIn);

  const availableTools = tools.filter(t => t.status === 'available');
  const filteredAvailableTools = availableTools.filter(t => {
    const q = assignSearch.toLowerCase().trim();
    if (!q) return true;
    return t.name.toLowerCase().includes(q) || t.serial.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
  });

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
      if (systemUserId && onUpdateUserRole && userRole !== editRole) {
        await onUpdateUserRole(systemUserId, editRole);
      }
      if (selectedUserUidToLink && onLinkUserAccount) {
        await onLinkUserAccount(selectedEngineer.id, selectedUserUidToLink);
      }
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmMerge = async () => {
    if (!mergeTargetId || !onMergeEngineers) return;
    await onMergeEngineers(mergeTargetId, selectedEngineer.id);
    setShowMergeModal(false);
  };

  const handleToggleToolSelection = (tool: ToolItem) => {
    setSelectedToolsToAssign(prev => 
      prev.some(t => t.id === tool.id)
        ? prev.filter(t => t.id !== tool.id)
        : [...prev, tool]
    );
  };

  const handleConfirmAssignment = async () => {
    if (selectedToolsToAssign.length === 0 || !onAssignPersonalTools) return;
    await onAssignPersonalTools(selectedEngineer.id, selectedToolsToAssign);
    setSelectedToolsToAssign([]);
    setShowAssignModal(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" 
      style={{ zoom: 1 / appZoom } as React.CSSProperties}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Cabecera / Expediente */}
        <div className="p-7 border-b flex justify-between items-start bg-slate-900 text-white relative overflow-hidden shrink-0">
          <div className="absolute right-0 top-0 opacity-5 pointer-events-none translate-x-1/4 -translate-y-1/4">
            <Users size={300}/>
          </div>
          
          <div className="flex items-center gap-6 relative z-10 flex-1">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl border border-blue-400/30 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-blue-900/50 shrink-0">
              {editName ? editName.charAt(0) : selectedEngineer.name.charAt(0)}
            </div>
            
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 flex-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Nombre Completo *
                  </label>
                  <input 
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Departamento / Área *
                  </label>
                  <select
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white outline-none focus:border-blue-500 transition-all"
                    value={editDepartment}
                    onChange={e => setEditDepartment(e.target.value)}
                  >
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Operaciones">Operaciones</option>
                    <option value="Instrumentación">Instrumentación</option>
                    <option value="Telecomunicaciones">Telecomunicaciones</option>
                    <option value="Seguridad y Control">Seguridad y Control</option>
                    <option value="Ingeniería">Ingeniería</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Estado Laboral *
                  </label>
                  <select
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white outline-none focus:border-blue-500 transition-all"
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as 'active' | 'inactive')}
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo (Ocultar/Blur)</option>
                  </select>
                </div>
                {email ? (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Rol de Acceso ({email}) *
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
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Vincular a Cuenta de Usuario
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white outline-none focus:border-blue-500 transition-all"
                      value={selectedUserUidToLink}
                      onChange={e => setSelectedUserUidToLink(e.target.value)}
                    >
                      <option value="">Sin cuenta vinculada (Opcional)</option>
                      {systemUsers.map(u => (
                        <option key={u.uid} value={u.uid}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="md:col-span-2 flex justify-end gap-2 mt-1">
                  <button 
                    onClick={() => {
                      setSelectedUserUidToLink('');
                      setIsEditing(false);
                    }} 
                    disabled={saving}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all border border-slate-700"
                  >
                    Descartar
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={saving || !editName.trim()}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-900/50 flex items-center gap-1.5"
                  >
                    <Save size={13}/> Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-blue-400 font-bold tracking-widest uppercase text-[10px] mb-1">
                  Expediente de Personal
                </p>
                <h2 className="text-2xl font-black tracking-tight mb-1.5 leading-none">
                  {selectedEngineer.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="text-slate-300 font-semibold bg-white/10 px-2.5 py-0.5 rounded-lg text-xs border border-white/5">
                    {selectedEngineer.department}
                  </span>
                  
                  {selectedEngineer.status === 'inactive' && (
                    <span className="text-red-300 font-semibold bg-red-500/10 px-2.5 py-0.5 rounded-lg text-xs border border-red-500/10 uppercase tracking-wider">
                      Inactivo
                    </span>
                  )}
                  
                  {email ? (
                    <span className="text-blue-300 font-semibold bg-blue-500/10 px-2.5 py-0.5 rounded-lg text-xs border border-blue-500/10">
                      🔑 {email} ({userRole === 'admin' ? 'Administrador' : userRole === 'bodeguero' ? 'Bodeguero' : 'Ingeniero'})
                    </span>
                  ) : (
                    <span className="text-slate-400 font-semibold bg-white/5 px-2.5 py-0.5 rounded-lg text-xs border border-white/5">
                      Sin cuenta de acceso
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-slate-400 text-[11px] font-mono">
                  {createdAt && (
                    <span>
                      📅 Registro: {new Date(createdAt).toLocaleDateString()}
                    </span>
                  )}
                  {email && (
                    <span>
                      🔑 Último acceso: {lastLogin ? `${new Date(lastLogin).toLocaleDateString()} ${new Date(lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Nunca'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 relative z-10">
            {isAdmin && !isEditing && (
              <>
                <button 
                  onClick={() => setShowMergeModal(true)} 
                  title="Fusionar con otro perfil duplicado"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all border border-white/10 hover:border-white/20 flex items-center gap-1.5 shadow-sm"
                >
                  <GitMerge size={13} className="text-purple-400"/> Fusionar
                </button>
                <button 
                  onClick={() => {
                    setEditName(selectedEngineer.name);
                    setEditDepartment(selectedEngineer.department);
                    setEditStatus(selectedEngineer.status || 'active');
                    setEditRole(userRole || 'ingeniero');
                    setSelectedUserUidToLink('');
                    setIsEditing(true);
                  }} 
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all border border-white/10 hover:border-white/20 flex items-center gap-1.5 shadow-sm"
                >
                  <Edit size={13}/> Editar
                </button>
              </>
            )}
            <button 
              onClick={() => setShowEngineerDetailsModal(false)} 
              className="bg-white/5 hover:bg-white/20 p-2 rounded-full transition-colors border border-transparent hover:border-white/10"
            >
              <X size={20}/>
            </button>
          </div>
        </div>
        
        {/* Modal Diálogo de Fusión */}
        {showMergeModal && (
          <div className="bg-purple-950/90 text-white p-5 border-b border-purple-800 animate-in slide-in-from-top-2">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-sm text-purple-200 flex items-center gap-2">
                  <GitMerge size={16}/> Fusionar Perfil Duplicado
                </h4>
                <p className="text-xs text-purple-300/80 mt-1">
                  Transfiere todo el historial de <strong>"{selectedEngineer.name}"</strong> hacia el perfil seleccionado y elimina el duplicado redundante.
                </p>
              </div>
              <button onClick={() => setShowMergeModal(false)} className="text-purple-400 hover:text-white p-1">
                <X size={16}/>
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-1">
                  Perfil de Destino a conservar:
                </label>
                <select 
                  className="w-full px-3 py-2 bg-purple-900/80 border border-purple-700 rounded-xl text-sm font-semibold text-white outline-none focus:border-purple-400"
                  value={mergeTargetId}
                  onChange={e => setMergeTargetId(e.target.value)}
                >
                  <option value="">Selecciona el perfil definitivo...</option>
                  {engineers.filter(e => e.id !== selectedEngineer.id).map(eng => {
                    const uMatch = systemUsers.find(u => u.uid === eng.id);
                    return (
                      <option key={eng.id} value={eng.id}>
                        {eng.name} ({eng.department}) {uMatch ? `· 🔑 [${uMatch.email}]` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              <button 
                onClick={handleConfirmMerge}
                disabled={!mergeTargetId}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-all whitespace-nowrap"
              >
                Confirmar Fusión
              </button>
            </div>
          </div>
        )}

        {/* Pestañas de Expediente */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-8 gap-8 shadow-sm z-10 relative shrink-0 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setEngineerModalTab('loans')} 
            className={`py-4 text-xs font-black border-b-2 transition-colors outline-none tracking-wide whitespace-nowrap ${
              engineerModalTab === 'loans' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            HISTORIAL DE EQUIPOS ({regularLoans.length})
          </button>
          <button 
            onClick={() => setEngineerModalTab('assigned')} 
            className={`py-4 text-xs font-black border-b-2 transition-colors outline-none tracking-wide whitespace-nowrap flex items-center gap-1.5 ${
              engineerModalTab === 'assigned' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck size={14}/> HERRAMIENTAS ASIGNADAS ({assignedLoans.length})
          </button>
          <button 
            onClick={() => setEngineerModalTab('consumables')} 
            className={`py-4 text-xs font-black border-b-2 transition-colors outline-none tracking-wide whitespace-nowrap ${
              engineerModalTab === 'consumables' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            MATERIAL ENTREGADO ({getEngineerConsumables(selectedEngineer.id).length})
          </button>
        </div>
        
        {/* Contenido de Pestañas */}
        <div className="flex-1 overflow-hidden bg-[#fafafa] flex flex-col min-h-0">
          
          {/* TAB 1: HISTORIAL DE EQUIPOS (REGULARES) */}
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
                    {regularLoans.map(l => (
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
                              En Terreno
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {regularLoans.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400 font-medium bg-slate-50/50">
                          No hay préstamos temporales registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: HERRAMIENTAS ASIGNADAS (PERMANENTES/PERSONALES) */}
          {engineerModalTab === 'assigned' && (
            <div className="overflow-auto custom-scrollbar flex-1 p-6 md:p-8 flex flex-col gap-5">
              
              {/* Barra de Acciones */}
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-purple-600"/> Herramientas Personales en Custodia
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Estas herramientas no generan alertas de vencimiento en el Centro de Control.
                  </p>
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => {
                      setSelectedToolsToAssign([]);
                      setAssignSearch('');
                      setShowAssignModal(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/20 transition-all"
                  >
                    <Plus size={14}/> Asignar Herramienta Personal
                  </button>
                )}
              </div>

              {/* Modal de Selección de Herramientas para Asignar */}
              {showAssignModal && (
                <div className="bg-white p-5 rounded-2xl border-2 border-purple-200 shadow-xl flex flex-col gap-4 animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        Seleccionar Herramientas para {selectedEngineer.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Mostrando herramientas disponibles en bodega ({availableTools.length} disponibles)
                      </p>
                    </div>
                    <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                      <X size={16}/>
                    </button>
                  </div>

                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input 
                      placeholder="Buscar por nombre, código o categoría..."
                      value={assignSearch}
                      onChange={e => setAssignSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-purple-400 transition-all font-medium"
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto custom-scrollbar divide-y border border-slate-100 rounded-xl">
                    {filteredAvailableTools.map(tool => {
                      const isSelected = selectedToolsToAssign.some(t => t.id === tool.id);
                      return (
                        <div 
                          key={tool.id} 
                          onClick={() => handleToggleToolSelection(tool)}
                          className={`p-3 flex items-center justify-between cursor-pointer hover:bg-purple-50/50 transition-colors ${
                            isSelected ? 'bg-purple-50/80 border-l-4 border-purple-600' : ''
                          }`}
                        >
                          <div>
                            <p className="font-bold text-xs text-slate-800">{tool.name}</p>
                            <p className="text-[10px] font-mono text-slate-400">
                              SN: {tool.serial || '—'} · Tag: {tool.orimec || 'N/A'} · {tool.category}
                            </p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={isSelected} 
                            onChange={() => {}} 
                            className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 pointer-events-none"
                          />
                        </div>
                      );
                    })}
                    {filteredAvailableTools.length === 0 && (
                      <p className="py-8 text-center text-xs text-slate-400">
                        No hay herramientas disponibles que coincidan.
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => setShowAssignModal(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleConfirmAssignment}
                      disabled={selectedToolsToAssign.length === 0}
                      className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all"
                    >
                      Asignar {selectedToolsToAssign.length > 0 ? `(${selectedToolsToAssign.length})` : ''}
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de Herramientas Asignadas */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm relative table-auto">
                  <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-md shadow-[0_1px_0_0_#e2e8f0] text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-3 bg-transparent whitespace-nowrap">Herramienta Asignada</th>
                      <th className="px-6 py-3 bg-transparent whitespace-nowrap">Fecha de Asignación</th>
                      <th className="px-6 py-3 text-center bg-transparent whitespace-nowrap">Estado</th>
                      <th className="px-6 py-3 text-right bg-transparent whitespace-nowrap">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dm-divide">
                    {assignedLoans.map(l => (
                      <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3 min-w-[200px] whitespace-normal">
                          <div className="font-bold text-slate-800 text-[13px] leading-tight">
                            {l.tools ? l.tools.map(t => t.name).join(', ') : 'Herramienta'}
                          </div>
                          {l.tools && l.tools[0]?.serial && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              SN: {l.tools.map(t => t.serial).join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="font-mono text-slate-900 text-xs font-semibold">
                            {new Date(l.dateOut).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Asignación Permanente
                          </div>
                        </td>
                        <td className="px-6 py-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-200/60 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                            <ShieldCheck size={12}/> Personal
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right whitespace-nowrap">
                          {isAdmin && onUnassignPersonalTool && (
                            <button 
                              onClick={() => onUnassignPersonalTool(l)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-xl transition-all shadow-sm"
                              title="Devolver herramienta a bodega"
                            >
                              <CornerDownLeft size={12}/> Devolver
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {assignedLoans.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400 font-medium bg-slate-50/50">
                          {selectedEngineer.name} no tiene herramientas personales asignadas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MATERIAL ENTREGADO (CONSUMIBLES) */}
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
