import React from 'react';
import { 
  Import, FileSpreadsheet, Printer, Plus, Search, 
  Image as ImageIcon, QrCode, Edit, Trash2, ChevronLeft, ChevronRight 
} from 'lucide-react';
import type { ToolItem } from '../tipos';
import { BadgeABC, BadgeEstado } from './Indicadores';

import type { UserRole } from '../tipos';

interface TabInventarioProps {
  tools: ToolItem[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterABC: 'ALL' | 'A' | 'B' | 'C';
  setFilterABC: (val: 'ALL' | 'A' | 'B' | 'C') => void;
  inventoryPage: number;
  setInventoryPage: React.Dispatch<React.SetStateAction<number>>;
  ITEMS_PER_PAGE: number;
  setShowImportModal: (show: boolean) => void;
  exportInventory: () => void;
  generateInventoryPDF: (tools: ToolItem[]) => void;
  openCreateToolModal: () => void;
  handleOpenDetails: (tool: ToolItem) => void;
  setSelectedTool: (tool: ToolItem) => void;
  setShowQRModal: (show: boolean) => void;
  openEditToolModal: (tool: ToolItem) => void;
  handleDeleteTool: (id: string) => void;
  
  userRole: UserRole;
  selectedRequestTools: ToolItem[];
  setSelectedRequestTools: React.Dispatch<React.SetStateAction<ToolItem[]>>;
  openSolicitudModal: () => void;
}

export const TabInventario: React.FC<TabInventarioProps> = ({
  tools,
  searchTerm,
  setSearchTerm,
  filterABC,
  setFilterABC,
  inventoryPage,
  setInventoryPage,
  ITEMS_PER_PAGE,
  setShowImportModal,
  exportInventory,
  generateInventoryPDF,
  openCreateToolModal,
  handleOpenDetails,
  setSelectedTool,
  setShowQRModal,
  openEditToolModal,
  handleDeleteTool,
  
  userRole,
  selectedRequestTools,
  setSelectedRequestTools,
  openSolicitudModal
}) => {
  const filteredTools = tools.filter(t => 
    (filterABC === 'ALL' || t.abcCategory === filterABC) && 
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     t.serial.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filteredTools.length / ITEMS_PER_PAGE));
  const paginatedTools = filteredTools.slice(
    (inventoryPage - 1) * ITEMS_PER_PAGE,
    inventoryPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex-shrink-0 space-y-4 mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold dm-text tracking-tight">Inventario Global</h2>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {userRole !== 'ingeniero' && (
              <>
                <button 
                  onClick={() => setShowImportModal(true)} 
                  className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors text-sm font-bold shadow-sm"
                >
                  <Import size={14}/> Importar
                </button>
                <button 
                  onClick={exportInventory} 
                  className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors text-sm font-bold shadow-sm"
                >
                  <FileSpreadsheet size={14}/> Excel
                </button>
                <button 
                  onClick={() => generateInventoryPDF(tools)} 
                  className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors text-sm font-bold shadow-sm"
                >
                  <Printer size={14}/> PDF
                </button>
                <button 
                  onClick={openCreateToolModal} 
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm font-bold shadow-md shadow-blue-600/20"
                >
                  <Plus size={14}/> Alta de Activo
                </button>
              </>
            )}
            {userRole === 'ingeniero' && (
              <button 
                onClick={openSolicitudModal}
                disabled={selectedRequestTools.length === 0}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 w-full md:w-auto"
              >
                <Plus size={14}/> Solicitar Préstamo ({selectedRequestTools.length})
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center dm-surface p-1.5 rounded-2xl border dm-border shadow-sm">
          <div className="flex bg-slate-100/70 p-1 rounded-xl w-full md:w-auto">
            {(['ALL', 'A', 'B', 'C'] as const).map((type) => {
              const count = type === 'ALL' ? tools.length : tools.filter(t => t.abcCategory === type).length;
              return (
                <button 
                  key={type} 
                  onClick={() => { setFilterABC(type); setInventoryPage(1); }} 
                  className={`px-5 py-2 text-xs font-bold rounded-lg transition-all flex-1 md:flex-none flex justify-center items-center gap-2 ${
                    filterABC === type 
                      ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {type === 'ALL' ? 'Todos' : `Clase ${type}`} 
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                    filterABC === type ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="relative w-full md:w-80 px-1 md:px-0 pr-1">
            <Search className="absolute left-4 md:left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar S/N o descripción..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 transition-all" 
              value={searchTerm} 
              onChange={(e) => { setSearchTerm(e.target.value); setInventoryPage(1); }} 
            />
          </div>
        </div>
      </div>

      <div className="dm-surface rounded-2xl border shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden dm-border">
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left text-sm relative table-auto">
            <thead className="sticky top-0 z-20 dm-surface2 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.08)]">
              <tr>
                {userRole === 'ingeniero' && (
                  <th className="px-4 py-3 font-bold dm-text3 text-[10px] uppercase tracking-widest w-10 text-center whitespace-nowrap">Sel</th>
                )}
                <th className="px-4 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-widest w-16 text-center whitespace-nowrap">Img</th>
                <th className="px-4 py-3 font-bold dm-text3 text-[10px] uppercase tracking-widest whitespace-nowrap">Detalle del Activo</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-widest text-center whitespace-nowrap">Clasificación</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-widest text-center whitespace-nowrap">Stock</th>
                <th className="px-4 py-3 font-bold dm-text3 text-[10px] uppercase tracking-widest whitespace-nowrap">Estatus</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-widest text-right pr-6 whitespace-nowrap">Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y dm-divide">
              {paginatedTools.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/5 transition-colors group">
                  {userRole === 'ingeniero' && (
                    <td className="px-4 py-2 align-middle text-center whitespace-nowrap">
                      <input 
                        type="checkbox"
                        disabled={t.status !== 'available'}
                        checked={selectedRequestTools.some(st => st.id === t.id)}
                        onChange={() => {
                          if (selectedRequestTools.some(st => st.id === t.id)) {
                            setSelectedRequestTools(selectedRequestTools.filter(st => st.id !== t.id));
                          } else {
                            setSelectedRequestTools([...selectedRequestTools, t]);
                          }
                        }}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-800"
                      />
                    </td>
                  )}
                  <td className="px-4 py-2 align-middle whitespace-nowrap">
                    <div 
                      className="w-10 h-10 rounded-md border border-slate-200 bg-white flex items-center justify-center mx-auto cursor-pointer shadow-sm overflow-hidden" 
                      onClick={() => handleOpenDetails(t)}
                    >
                      {t.imageUrl ? <img src={t.imageUrl} className="w-full h-full object-cover" alt=""/> : <ImageIcon size={14} className="text-slate-300"/>}
                    </div>
                  </td>
                  <td className="px-4 py-2 align-middle cursor-pointer min-w-[200px]" onClick={() => handleOpenDetails(t)}>
                    <p className="font-bold dm-text group-hover:text-blue-500 transition-colors text-xs whitespace-normal leading-tight">{t.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold dm-text3 font-mono dm-surface2 px-1.5 py-0.5 rounded border dm-border whitespace-nowrap">SN: {t.serial}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center align-middle whitespace-nowrap">
                    <BadgeABC category={t.abcCategory} />
                  </td>
                  <td className="px-4 py-2 text-center align-middle font-bold dm-text2 text-xs whitespace-nowrap">
                    {t.quantity}
                  </td>
                  <td className="px-4 py-2 align-middle whitespace-nowrap">
                    <BadgeEstado status={t.status} />
                  </td>
                  <td className="px-4 py-2 align-middle text-right pr-6 whitespace-nowrap">
                    {userRole !== 'ingeniero' && (
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setSelectedTool(t); setShowQRModal(true); }} 
                          className="p-1.5 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-200 transition-colors"
                        >
                          <QrCode size={14}/>
                        </button>
                        <button 
                          onClick={() => openEditToolModal(t)} 
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          <Edit size={14}/>
                        </button>
                        <button 
                          onClick={() => handleDeleteTool(t.id)} 
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTools.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm font-medium text-slate-400">
                    No se encontraron activos para los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t dm-border dm-surface2 shrink-0">
            <span className="text-[10px] dm-text3">
              {filteredTools.length} activos · página {Math.min(inventoryPage, totalPages)} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setInventoryPage(p => Math.max(1, p - 1))} 
                disabled={inventoryPage <= 1} 
                className="p-1.5 rounded-lg border dm-border dm-surface dm-text2 hover:bg-blue-50 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={13}/>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - inventoryPage) <= 1)
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && <span className="dm-text3 text-xs px-1">…</span>}
                    <button 
                      onClick={() => setInventoryPage(p)} 
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                        inventoryPage === p ? 'bg-blue-600 text-white' : 'dm-surface border dm-border dm-text2 hover:bg-blue-50'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              <button 
                onClick={() => setInventoryPage(p => Math.min(totalPages, p + 1))} 
                disabled={inventoryPage >= totalPages} 
                className="p-1.5 rounded-lg border dm-border dm-surface dm-text2 hover:bg-blue-50 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={13}/>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
