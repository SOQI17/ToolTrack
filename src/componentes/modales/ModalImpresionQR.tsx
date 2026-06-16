import React from 'react';
import { Printer, X } from 'lucide-react';
import type { ToolItem } from '../../tipos';

interface ModalImpresionQRProps {
  selectedTool: ToolItem;
  setShowQRModal: (show: boolean) => void;
  generateQRUrl: (tool: ToolItem) => string;
}

export const ModalImpresionQR: React.FC<ModalImpresionQRProps> = ({
  selectedTool,
  setShowQRModal,
  generateQRUrl
}) => {
  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" 
      onClick={() => setShowQRModal(false)}
    >
      <div 
        id="printable-qr" 
        className="bg-white p-10 rounded-3xl shadow-2xl text-center border border-slate-200 w-[340px]" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col items-center">
          <p className="font-black text-xs tracking-[0.3em] uppercase text-slate-900 mb-6 border-b-2 border-slate-900 pb-2">
            Orimec Assets
          </p>
          <div className="bg-white p-3 border-4 border-slate-900 rounded-2xl mb-6 shadow-sm">
            <img src={generateQRUrl(selectedTool)} alt="QR Code" className="w-48 h-48" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 uppercase">
            {selectedTool.name}
          </h3>
          <div className="bg-slate-100 border border-slate-200 px-4 py-1.5 rounded-lg">
            <p className="text-slate-600 font-mono text-sm font-bold">SN: {selectedTool.serial}</p>
            {selectedTool.orimec && (
              <p className="text-blue-600 font-mono text-xs font-bold mt-0.5">ID: {selectedTool.orimec}</p>
            )}
          </div>
        </div>
        <button 
          onClick={() => window.print()} 
          className="mt-8 w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 no-print flex items-center justify-center gap-2"
        >
          <Printer size={18}/> Imprimir Etiqueta
        </button>
      </div>
    </div>
  );
};
