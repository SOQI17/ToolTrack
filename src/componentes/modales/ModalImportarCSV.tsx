import React from 'react';
import { X, Import, CheckCircle } from 'lucide-react';
import { writeBatch, doc, collection } from 'firebase/firestore';
import { db, appId } from '../../firebase';
import type { ToolItem } from '../../tipos';
import { BadgeABC } from '../Indicadores';
import { handleImportCSV } from '../../utilidades';

interface ModalImportarCSVProps {
  setShowImportModal: (show: boolean) => void;
  importPreview: any[];
  setImportPreview: React.Dispatch<React.SetStateAction<any[]>>;
  importErrors: string[];
  setImportErrors: React.Dispatch<React.SetStateAction<string[]>>;
  importFileRef: React.RefObject<HTMLInputElement | null>;
  tools: ToolItem[];
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ModalImportarCSV: React.FC<ModalImportarCSVProps> = ({
  setShowImportModal,
  importPreview,
  setImportPreview,
  importErrors,
  setImportErrors,
  importFileRef,
  tools,
  addToast
}) => {
  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={() => setShowImportModal(false)}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-[#1a3a6b] px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">Carga masiva</p>
            <p className="font-bold text-white text-lg">Importar desde CSV / Excel</p>
          </div>
          <button onClick={() => setShowImportModal(false)} className="text-blue-300 hover:text-white p-1.5 rounded-lg">
            <X size={16}/>
          </button>
        </div>
        
        <div className="px-6 py-5 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
          {importPreview.length === 0 ? (
            <div>
              {importErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest mb-2">⚠ No se pudieron leer registros</p>
                  {importErrors.map((e, i) => (
                    <p key={i} className="text-xs text-red-700 mb-1">{e}</p>
                  ))}
                  <p className="text-[10px] text-red-500 mt-2">Intenta de nuevo seleccionando otro archivo.</p>
                </div>
              )}
              
              <div 
                className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all" 
                onClick={() => {
                  if (importFileRef.current) {
                    importFileRef.current.value = '';
                    importFileRef.current.click();
                  }
                }}
              >
                <Import size={32} className="mx-auto text-slate-300 mb-3"/>
                <p className="text-sm font-bold text-slate-600">Haz clic para seleccionar un archivo CSV</p>
                <p className="text-xs text-slate-400 mt-1">Compatible con el Registro Maestro ORIMEC exportado a CSV</p>
              </div>
              
              <input 
                ref={importFileRef} 
                type="file" 
                accept=".csv,.txt,.xls,.xlsx" 
                className="hidden" 
                onChange={(e) => {
                  setImportErrors([]);
                  handleImportCSV(e, setImportPreview, setImportErrors, tools);
                }}
              />
              
              <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-1.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Formato ORIMEC — Registro Maestro</p>
                <code className="text-[10px] text-slate-600 font-mono block">PN ORIMEC;Nombre;PN;Cantidad;Modalidad;Familia;Estado;Grupo</code>
                <code className="text-[10px] text-slate-400 font-mono block">ORI-0001;Acrilicos Mamo grandes;MG;12;MG;Herramienta;Operativa;C</code>
                <div className="border-t border-slate-200 my-2"/>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Formato genérico (también compatible)</p>
                <code className="text-[10px] text-slate-500 font-mono block">Nombre;Serie;Categoria;Clase;Condicion;Cantidad;Tag</code>
                <p className="text-[9px] text-blue-600 font-semibold mt-2">✓ Los registros ya existentes se omiten automáticamente (sin duplicados)</p>
              </div>
            </div>
          ) : (
            <div>
              {importErrors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Advertencias / Omisiones</p>
                  {importErrors.map((e, i) => (
                    <p key={i} className="text-xs text-amber-700">{e}</p>
                  ))}
                </div>
              )}
              
              <p className="text-xs font-bold text-slate-600 mb-3">{importPreview.length} registros nuevos listos para importar:</p>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {['ID ORIMEC', 'Nombre', 'PN/Serie', 'Familia', 'Clase', 'Estado'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-bold text-slate-500 text-[10px] uppercase">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importPreview.slice(0, 10).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-mono text-slate-400 text-[10px]">{r.orimec || '—'}</td>
                        <td className="px-3 py-2 font-semibold text-slate-800">{r.name}</td>
                        <td className="px-3 py-2 font-mono text-slate-500 text-[10px]">{r.serial || '—'}</td>
                        <td className="px-3 py-2 text-slate-600">{r.category}</td>
                        <td className="px-3 py-2">
                          <BadgeABC category={r.abcCategory}/>
                        </td>
                        <td className="px-3 py-2 text-slate-600">{r.condition}</td>
                      </tr>
                    ))}
                    {importPreview.length > 10 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-2 text-center text-slate-400 text-xs">
                          ...y {importPreview.length - 10} más
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex gap-3 shrink-0">
          <button 
            onClick={() => {
              setShowImportModal(false);
              setImportPreview([]);
              setImportErrors([]);
            }} 
            className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100"
          >
            Cancelar
          </button>
          
          {importPreview.length > 0 && (
            <button 
              onClick={async () => {
                try {
                  const batch = writeBatch(db);
                  importPreview.forEach(item => {
                    const ref = doc(collection(db, 'artifacts', appId, 'public', 'data', 'tools'));
                    batch.set(ref, item);
                  });
                  await batch.commit();
                  addToast(`${importPreview.length} activos importados`);
                  setShowImportModal(false);
                  setImportPreview([]);
                  setImportErrors([]);
                } catch (e) {
                  addToast('Error al importar', 'error');
                }
              }} 
              className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-[#1a3a6b] rounded-xl hover:bg-blue-800 flex items-center justify-center gap-2 shadow-md"
            >
              <CheckCircle size={14}/> Importar {importPreview.length} activos
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
