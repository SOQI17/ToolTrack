import React from 'react';
import { 
  X, Image as ImageIcon, FileText, Trash2, Upload, 
  Wrench, Users, CheckCircle, Plus, Package 
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase';
import type { ToolItem, Loan, Engineer, ToolComponent } from '../../tipos';
import { BadgeABC } from '../Indicadores';

interface ModalDetalleActivoProps {
  selectedTool: ToolItem;
  setSelectedTool: (t: ToolItem) => void;
  setShowDetailsModal: (show: boolean) => void;
  modalTab: 'general' | 'maintenance' | 'history' | 'components';
  setModalTab: (tab: any) => void;
  appZoom: number;
  loans: Loan[];
  engineers: Engineer[];
  getEngineerName: (id: string) => string;
  isAdmin: boolean;
  newFile: { name: string; url: string };
  setNewFile: React.Dispatch<React.SetStateAction<{ name: string; url: string }>>;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleAddFileToTool: () => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  newMaintenance: any;
  setNewMaintenance: React.Dispatch<React.SetStateAction<any>>;
  handleAddMaintenance: () => void;
  newComponent: any;
  setNewComponent: React.Dispatch<React.SetStateAction<any>>;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ModalDetalleActivo: React.FC<ModalDetalleActivoProps> = ({
  selectedTool,
  setSelectedTool,
  setShowDetailsModal,
  modalTab,
  setModalTab,
  appZoom,
  loans,
  engineers,
  getEngineerName,
  isAdmin,
  newFile,
  setNewFile,
  selectedFile,
  setSelectedFile,
  fileInputRef,
  handleAddFileToTool,
  handleFileSelect,
  newMaintenance,
  setNewMaintenance,
  handleAddMaintenance,
  newComponent,
  setNewComponent,
  addToast
}) => {

  const handleDeleteFileFromTool = async (idx: number) => {
    if (!selectedTool) return;
    try {
      const updatedFiles = (selectedTool.files || []).filter((_, i) => i !== idx);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tools', selectedTool.id), { files: updatedFiles });
      setSelectedTool({ ...selectedTool, files: updatedFiles });
      addToast('Archivo eliminado', 'info');
    } catch (e: any) {
      alert("Error al eliminar archivo: " + e.message);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" 
      style={{ zoom: 1 / appZoom } as React.CSSProperties}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col relative overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedTool.name}</h2>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
              SN: {selectedTool.serial}
            </span>
          </div>
          <button 
            onClick={() => setShowDetailsModal(false)} 
            className="text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X size={20}/>
          </button>
        </div>
        
        <div className="flex border-b border-slate-200 px-6 gap-8 bg-slate-50/50 shrink-0 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setModalTab('general')} 
            className={`py-4 text-sm font-bold border-b-2 transition-colors outline-none tracking-wide whitespace-nowrap ${
              modalTab === 'general' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            FICHA TÉCNICA
          </button>
          <button 
            onClick={() => setModalTab('maintenance')} 
            className={`py-4 text-sm font-bold border-b-2 transition-colors outline-none tracking-wide whitespace-nowrap ${
              modalTab === 'maintenance' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            MANTENIMIENTO
          </button>
          <button 
            onClick={() => setModalTab('history')} 
            className={`py-4 text-sm font-bold border-b-2 transition-colors outline-none tracking-wide whitespace-nowrap ${
              modalTab === 'history' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            TRAZABILIDAD
          </button>
          <button 
            onClick={() => setModalTab('components')} 
            className={`py-4 text-sm font-bold border-b-2 transition-colors outline-none tracking-wide whitespace-nowrap flex items-center gap-2 ${
              modalTab === 'components' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            COMPONENTES {selectedTool.components && selectedTool.components.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {selectedTool.components.length}
              </span>
            )}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white custom-scrollbar">
          {modalTab === 'general' && (
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-5/12 space-y-6">
                <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-center overflow-hidden shadow-inner">
                  {selectedTool.imageUrl ? (
                    <img src={selectedTool.imageUrl} className="w-full h-full object-cover" alt={selectedTool.name} />
                  ) : (
                    <ImageIcon size={48} className="text-slate-300" />
                  )}
                </div>
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                  <div className="grid grid-cols-2 gap-y-5 text-sm">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Categoría</p>
                      <p className="font-semibold text-slate-800">{selectedTool.category}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Clase</p>
                      <BadgeABC category={selectedTool.abcCategory} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">ID Interno</p>
                      <p className="font-mono font-bold text-slate-700">{selectedTool.orimec || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Condición</p>
                      <p className="font-semibold text-slate-800">{selectedTool.condition}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-7/12 flex flex-col space-y-6">
                {selectedTool.abcCategory === 'A' && (
                  <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-200/60 flex justify-between items-center shadow-sm shrink-0">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-1">Calibración Efectuada</p>
                      <p className="font-bold text-orange-900 font-mono text-sm">{selectedTool.lastCalibration || 'Sin registro'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-1">Próxima Alerta</p>
                      <p className="font-black text-red-600 font-mono text-base">{selectedTool.nextCalibration || 'Sin programar'}</p>
                    </div>
                  </div>
                )}
                
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex-1 flex flex-col overflow-hidden min-h-0">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                    <h4 className="font-bold text-slate-700 text-xs uppercase tracking-widest flex items-center gap-2">
                      <FileText size={14} className="text-blue-500"/> Documentación Digital
                    </h4>
                  </div>
                  
                  <div className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                    {selectedTool.files?.map((f, i) => (
                      <div 
                        key={i} 
                        className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-100 group transition-all"
                      >
                        <a 
                          href={f.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 truncate flex-1 flex items-center gap-2"
                        >
                          <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-200">
                            <FileText size={14}/>
                          </div> 
                          {f.name}
                        </a>
                        <button 
                          onClick={() => handleDeleteFileFromTool(i)} 
                          className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 px-2 transition-all"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    ))}
                    {(!selectedTool.files || selectedTool.files.length === 0) && (
                      <p className="text-slate-400 text-xs font-medium text-center py-8">Repositorio documental vacío.</p>
                    )}
                  </div>
                  
                  <div className="p-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Etiqueta" 
                        className="w-1/3 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium" 
                        value={newFile.name} 
                        onChange={(e) => setNewFile({ ...newFile, name: e.target.value })} 
                      />
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileSelect} 
                      />
                      {selectedFile ? (
                        <div className="flex-1 flex items-center gap-2 bg-white px-3 py-2 rounded-lg text-sm border border-slate-300 overflow-hidden shadow-sm font-medium text-blue-700">
                          <span className="truncate flex-1">{selectedFile.name}</span>
                          <button onClick={() => setSelectedFile(null)} className="hover:text-red-500 p-1">
                            <X size={14}/>
                          </button>
                        </div>
                      ) : (
                        <>
                          <input 
                            type="text" 
                            placeholder="URL (Opcional)" 
                            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                            value={newFile.url} 
                            onChange={(e) => setNewFile({ ...newFile, url: e.target.value })} 
                          />
                          <button 
                            onClick={() => fileInputRef.current?.click()} 
                            className="bg-white border border-slate-300 px-3 rounded-lg hover:bg-slate-50 shadow-sm text-slate-600" 
                            title="Subir archivo local"
                          >
                            <Upload size={16}/>
                          </button>
                        </>
                      )}
                      <button 
                        onClick={handleAddFileToTool} 
                        disabled={!newFile.name} 
                        className="bg-blue-600 text-white px-4 rounded-lg disabled:opacity-50 font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all"
                      >
                        Anexar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {modalTab === 'maintenance' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
                  <Wrench size={16}/> Bitácora de Intervención
                </h4>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col md:flex-row gap-3">
                    <input 
                      className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium bg-white" 
                      placeholder="Detalle del mantenimiento..." 
                      value={newMaintenance.description} 
                      onChange={e => setNewMaintenance({ ...newMaintenance, description: e.target.value })} 
                    />
                    <input 
                      className="w-32 px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-bold bg-white" 
                      type="number" 
                      placeholder="USD 0.00" 
                      value={newMaintenance.cost || ''} 
                      onChange={e => setNewMaintenance({ ...newMaintenance, cost: parseFloat(e.target.value) })} 
                    />
                    <input 
                      className="w-48 px-4 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium bg-white" 
                      placeholder="Responsable/Taller" 
                      value={newMaintenance.technician} 
                      onChange={e => setNewMaintenance({ ...newMaintenance, technician: e.target.value })} 
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <div 
                        className={`w-9 h-5 rounded-full transition-colors relative ${newMaintenance.isCalibration ? 'bg-blue-600' : 'bg-slate-300'}`} 
                        onClick={() => setNewMaintenance({ ...newMaintenance, isCalibration: !newMaintenance.isCalibration })}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-transform ${newMaintenance.isCalibration ? 'translate-x-4' : 'translate-x-0.5'}`}/>
                      </div>
                      <span className="text-xs font-bold text-slate-600">Es calibración</span>
                    </label>
                    
                    {newMaintenance.isCalibration && (
                      <div className="flex items-center gap-3 flex-1 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Fecha calibración</span>
                          <input 
                            type="date" 
                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" 
                            value={newMaintenance.newLastCal} 
                            onChange={e => setNewMaintenance({ ...newMaintenance, newLastCal: e.target.value })}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Próxima calibración</span>
                          <input 
                            type="date" 
                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white" 
                            value={newMaintenance.newNextCal} 
                            onChange={e => setNewMaintenance({ ...newMaintenance, newNextCal: e.target.value })}
                          />
                        </div>
                        <p className="text-[9px] text-blue-600 font-semibold whitespace-nowrap">✓ Eliminará la alerta activa</p>
                      </div>
                    )}
                    
                    <button 
                      onClick={handleAddMaintenance} 
                      disabled={!newMaintenance.isCalibration && !newMaintenance.description} 
                      className={`ml-auto px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 shadow-md transition-all ${
                        newMaintenance.isCalibration 
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 text-white'
                      }`}
                    >
                      {newMaintenance.isCalibration ? 'Registrar Calibración' : 'Registrar'}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {selectedTool.maintenanceHistory?.map((m, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex justify-between items-center hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-center items-center shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                          {new Date(m.date).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-lg font-black text-slate-700 leading-tight">
                          {new Date(m.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-[15px]">{m.description}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                          <Users size={12}/> Ejecutado por: {m.technician}
                        </p>
                      </div>
                    </div>
                    <div className="font-mono text-slate-800 font-black text-lg bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      ${m.cost}
                    </div>
                  </div>
                ))}
                
                {(!selectedTool.maintenanceHistory || selectedTool.maintenanceHistory.length === 0) && (
                  <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <Wrench size={32} className="mx-auto text-slate-300 mb-3"/>
                    <p className="text-sm font-medium text-slate-500">Historial técnico en blanco.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {modalTab === 'history' && (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col max-h-[400px]">
              <div className="overflow-auto custom-scrollbar flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap relative">
                  <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-md shadow-[0_1px_0_0_#e2e8f0] text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-3 bg-transparent">Ventana Operativa</th>
                      <th className="px-6 py-3 bg-transparent">Custodio Asignado</th>
                      <th className="px-6 py-3 bg-transparent">Punto de Destino</th>
                      <th className="px-6 py-3 text-center bg-transparent">Resolución</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dm-divide">
                    {loans.filter(l => (l.tools && l.tools.some(t => t.id === selectedTool.id)) || l.toolId === selectedTool.id)
                      .sort((a, b) => new Date(b.dateOut).getTime() - new Date(a.dateOut).getTime())
                      .map(l => (
                        <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="font-mono text-slate-800 font-medium text-xs">
                              {new Date(l.dateOut).toLocaleDateString()}
                            </div>
                            <div className="font-mono text-slate-400 text-[10px] mt-0.5">
                              ↳ {l.dateIn ? new Date(l.dateIn).toLocaleDateString() : 'Operación Activa'}
                            </div>
                          </td>
                          <td className="px-6 py-3 font-bold text-slate-700">{getEngineerName(l.engineerId)}</td>
                          <td className="px-6 py-3">
                            <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600">
                              {l.project || l.client || l.purpose}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            {l.dateIn ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                <CheckCircle size={12}/> Cerrado
                              </span>
                            ) : (
                              <span className="inline-block text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                En Terreno
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {loans.filter(l => (l.tools && l.tools.some(t => t.id === selectedTool.id)) || l.toolId === selectedTool.id).length === 0 && (
                <div className="py-12 text-center bg-slate-50/50">
                  <p className="text-sm font-medium text-slate-400">Activo sin movimientos registrados.</p>
                </div>
              )}
            </div>
          )}

          {modalTab === 'components' && (
            <div className="space-y-6">
              {isAdmin && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                  <h4 className="font-bold text-slate-700 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Plus size={14} className="text-blue-500"/> Agregar Componente
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <input 
                      className="px-3 py-2 border border-slate-300 bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono font-bold" 
                      placeholder="ID (ORNM-0001)" 
                      value={newComponent.orimec || ''} 
                      onChange={e => setNewComponent({ ...newComponent, orimec: e.target.value })} 
                    />
                    <input 
                      className="col-span-2 px-3 py-2 border border-slate-300 bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium" 
                      placeholder="Nombre del componente *" 
                      value={newComponent.name || ''} 
                      onChange={e => setNewComponent({ ...newComponent, name: e.target.value })} 
                    />
                    <input 
                      className="px-3 py-2 border border-slate-300 bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono" 
                      placeholder="Serie" 
                      value={newComponent.serial || ''} 
                      onChange={e => setNewComponent({ ...newComponent, serial: e.target.value })} 
                    />
                    <input 
                      className="px-3 py-2 border border-slate-300 bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono" 
                      placeholder="PN GE (opcional)" 
                      value={newComponent.pnGE || ''} 
                      onChange={e => setNewComponent({ ...newComponent, pnGE: e.target.value })} 
                    />
                    <input 
                      type="number" 
                      min="1" 
                      className="px-3 py-2 border border-slate-300 bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-center font-bold" 
                      placeholder="Cant." 
                      value={newComponent.quantity || 1} 
                      onChange={e => setNewComponent({ ...newComponent, quantity: parseInt(e.target.value) || 1 })} 
                    />
                    <select 
                      className="px-3 py-2 border border-slate-300 bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" 
                      value={newComponent.estado || 'Operativa'} 
                      onChange={e => setNewComponent({ ...newComponent, estado: e.target.value })}
                    >
                      <option>Operativa</option>
                      <option>En Uso</option>
                      <option>Mantenimiento</option>
                      <option>Dano</option>
                    </select>
                    <div className="col-span-2 md:col-span-1 flex justify-end">
                      <button 
                        disabled={!newComponent.name} 
                        onClick={async () => {
                          if (!selectedTool || !newComponent.name) return;
                          const comp: ToolComponent = {
                            id: Date.now().toString(),
                            orimec: newComponent.orimec || '',
                            name: newComponent.name || '',
                            serial: newComponent.serial || '',
                            pnGE: newComponent.pnGE || '',
                            quantity: newComponent.quantity || 1,
                            modalidad: newComponent.modalidad || 'Todas',
                            estado: newComponent.estado || 'Operativa'
                          };
                          const updated = [...(selectedTool.components || []), comp];
                          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tools', selectedTool.id), { components: updated });
                          setSelectedTool({ ...selectedTool, components: updated });
                          setNewComponent({ orimec: '', name: '', serial: '', pnGE: '', quantity: 1, modalidad: 'Todas', estado: 'Operativa' });
                          addToast('Componente agregado');
                        }} 
                        className="w-full px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl disabled:opacity-50 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={14}/> Agregar
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {(!selectedTool.components || selectedTool.components.length === 0) ? (
                <div className="py-14 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <Package size={32} className="mx-auto text-slate-300 mb-3"/>
                  <p className="text-sm font-medium text-slate-500">Este activo no tiene componentes registrados.</p>
                  {isAdmin && <p className="text-xs text-slate-400 mt-1">Usa el formulario de arriba para agregar los componentes del kit.</p>}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200/60 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {selectedTool.components.length} componente{selectedTool.components.length !== 1 ? 's' : ''} en este kit
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Total uds: {selectedTool.components.reduce((s, c) => s + c.quantity, 0)}
                    </span>
                  </div>
                  
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50/80 border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">ID</th>
                          <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descripción</th>
                          <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Serie / PN GE</th>
                          <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Cant.</th>
                          <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                          {isAdmin && <th className="px-4 py-2.5 w-8"></th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedTool.components.map((comp, idx) => (
                          <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-4 py-3 font-mono font-bold text-blue-700 text-[11px] whitespace-nowrap">
                              {comp.orimec || '--'}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-800 min-w-[180px]">{comp.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className="font-mono text-slate-600 text-[11px]">{comp.serial || '--'}</p>
                              {comp.pnGE && <p className="font-mono text-slate-400 text-[10px] mt-0.5">GE: {comp.pnGE}</p>}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-slate-700">{comp.quantity}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                comp.estado === 'Operativa' 
                                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' 
                                  : comp.estado === 'Dano' || comp.estado === 'Dañado' 
                                    ? 'bg-red-50 text-red-700 ring-1 ring-red-600/20' 
                                    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                              }`}>
                                {comp.estado}
                              </span>
                            </td>
                            {isAdmin && (
                              <td className="px-4 py-3">
                                <button 
                                  onClick={async () => {
                                    const updated = (selectedTool.components || []).filter((_, i) => i !== idx);
                                    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tools', selectedTool.id), { components: updated });
                                    setSelectedTool({ ...selectedTool, components: updated });
                                    addToast('Componente eliminado', 'info');
                                  }} 
                                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 rounded transition-all"
                                >
                                  <Trash2 size={13}/>
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
