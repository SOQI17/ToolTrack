import React from 'react';
import { X, Calendar, Image as ImageIcon, Upload, CheckCircle } from 'lucide-react';
import type { ToolItem, ABCCategory } from '../../tipos';

interface ModalFormularioActivoProps {
  isEditingTool: boolean;
  newTool: Partial<ToolItem>;
  setNewTool: React.Dispatch<React.SetStateAction<Partial<ToolItem>>>;
  setShowToolModal: (show: boolean) => void;
  handleSaveTool: () => void;
  toolImageInputRef: React.RefObject<HTMLInputElement | null>;
  handleToolImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedToolImage: File | null;
  setSelectedToolImage: (file: File | null) => void;
  appZoom: number;
}

export const ModalFormularioActivo: React.FC<ModalFormularioActivoProps> = ({
  isEditingTool,
  newTool,
  setNewTool,
  setShowToolModal,
  handleSaveTool,
  toolImageInputRef,
  handleToolImageSelect,
  selectedToolImage,
  setSelectedToolImage,
  appZoom
}) => {
  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" 
      style={{ zoom: 1 / appZoom } as React.CSSProperties}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <h3 className="font-black text-2xl text-slate-900 tracking-tight">
            {isEditingTool ? 'Actualizar Activo' : 'Registrar Nuevo Activo'}
          </h3>
          <button 
            onClick={() => setShowToolModal(false)} 
            className="text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X size={20}/>
          </button>
        </div>
        
        <div className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">
              Identificadores Core
            </h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Descripción del Equipo *
              </label>
              <input 
                className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm" 
                placeholder="Ej. Sierra Circular 20V" 
                value={newTool.name || ''} 
                onChange={e => setNewTool({ ...newTool, name: e.target.value })} 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  No. Serie *
                </label>
                <input 
                  className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-mono font-bold uppercase shadow-sm" 
                  placeholder="SN-XXXX" 
                  value={newTool.serial || ''} 
                  onChange={e => setNewTool({ ...newTool, serial: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Tag Interno
                </label>
                <input 
                  className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-mono font-bold uppercase shadow-sm" 
                  placeholder="OPT-001" 
                  value={newTool.orimec || ''} 
                  onChange={e => setNewTool({ ...newTool, orimec: e.target.value })} 
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">
              Clasificación
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Familia Tecnológica
                </label>
                <select 
                  className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm" 
                  value={newTool.category || 'Eléctricas'} 
                  onChange={e => setNewTool({ ...newTool, category: e.target.value })}
                >
                  <option>Eléctricas</option>
                  <option>Medición</option>
                  <option>Manuales</option>
                  <option>Seguridad</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Criticidad (ABC)
                </label>
                <select 
                  className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm" 
                  value={newTool.abcCategory || 'B'} 
                  onChange={e => setNewTool({ ...newTool, abcCategory: e.target.value as ABCCategory })}
                >
                  <option value="A">Clase A (Alta / Calibrable)</option>
                  <option value="B">Clase B (Media)</option>
                  <option value="C">Clase C (Baja)</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Volumen Base
                </label>
                <input 
                  type="number" 
                  min="1" 
                  className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-mono font-bold shadow-sm" 
                  value={newTool.quantity || 1} 
                  onChange={e => setNewTool({ ...newTool, quantity: parseInt(e.target.value) || 1 })} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Estado Físico
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-slate-300 bg-white rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm" 
                  placeholder="Ej. Óptimo" 
                  value={newTool.condition || 'Buena'} 
                  onChange={e => setNewTool({ ...newTool, condition: e.target.value })} 
                />
              </div>
            </div>
          </div>

          {newTool.abcCategory === 'A' && (
            <div className="bg-orange-50/80 p-6 rounded-2xl border border-orange-200/60 shadow-sm animate-in zoom-in-95">
              <h4 className="text-xs font-black text-orange-800 mb-4 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14}/> Parámetros de Calibración
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-orange-600/80 mb-1.5 uppercase tracking-wider">
                    Certificado Actual
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 border border-orange-200 bg-white rounded-xl text-sm font-mono focus:border-orange-400 outline-none shadow-sm" 
                    value={newTool.lastCalibration || ''} 
                    onChange={e => setNewTool({ ...newTool, lastCalibration: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-red-500 mb-1.5 uppercase tracking-wider">
                    Fecha de Expiración
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 border border-red-200 bg-white rounded-xl text-sm font-mono focus:border-red-400 outline-none shadow-sm" 
                    value={newTool.nextCalibration || ''} 
                    onChange={e => setNewTool({ ...newTool, nextCalibration: e.target.value })} 
                  />
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Recurso Fotográfico
            </label>
            <div className="flex gap-3 items-center">
              <input 
                type="file" 
                ref={toolImageInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleToolImageSelect} 
              />
              {selectedToolImage ? (
                <div className="flex-1 flex items-center gap-3 bg-blue-50 px-4 py-3 border border-blue-200 rounded-xl shadow-sm">
                  <ImageIcon size={18} className="text-blue-600"/>
                  <span className="truncate flex-1 text-sm font-semibold text-blue-900">
                    {selectedToolImage.name}
                  </span>
                  <button 
                    onClick={() => setSelectedToolImage(null)} 
                    className="hover:bg-blue-200 p-1.5 rounded-lg text-blue-600 transition-colors"
                  >
                    <X size={16}/>
                  </button>
                </div>
              ) : (
                <>
                  <input 
                    type="text" 
                    className="flex-1 px-4 py-3 border border-slate-300 bg-white rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm" 
                    placeholder="URL Web de la imagen..." 
                    value={newTool.imageUrl || ''} 
                    onChange={(e) => setNewTool({ ...newTool, imageUrl: e.target.value })} 
                  />
                  <button 
                    onClick={() => toolImageInputRef.current?.click()} 
                    className="bg-slate-100 border border-slate-300 px-5 py-3 rounded-xl hover:bg-slate-200 text-sm font-bold text-slate-700 shadow-sm transition-colors flex items-center gap-2"
                  >
                    <Upload size={16}/> Archivo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={() => setShowToolModal(false)} 
            className="px-6 py-3 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-100 shadow-sm transition-colors"
          >
            Descartar
          </button>
          <button 
            onClick={handleSaveTool} 
            disabled={!newTool.name || !newTool.serial} 
            className="px-8 py-3 bg-blue-600 text-white text-sm font-black rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
          >
            <CheckCircle size={18}/> {isEditingTool ? 'Guardar Cambios' : 'Procesar Alta'}
          </button>
        </div>
      </div>
    </div>
  );
};
