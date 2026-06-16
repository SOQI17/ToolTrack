import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Briefcase, User, FileText } from 'lucide-react';
import type { ToolItem } from '../../tipos';

interface ModalFormularioSolicitudProps {
  selectedTools: ToolItem[];
  setShowSolicitudModal: (show: boolean) => void;
  onSubmitSolicitud: (data: {
    targetDate: string;
    durationDays: number;
    destination: string;
    purpose: string;
    project?: string;
    client?: string;
  }) => void;
  appZoom: number;
}

export const ModalFormularioSolicitud: React.FC<ModalFormularioSolicitudProps> = ({
  selectedTools,
  setShowSolicitudModal,
  onSubmitSolicitud,
  appZoom
}) => {
  const [targetDate, setTargetDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [durationDays, setDurationDays] = useState<number>(1);
  const [destination, setDestination] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [project, setProject] = useState<string>('');
  const [client, setClient] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim() || !purpose.trim() || !targetDate || durationDays <= 0) {
      alert("Por favor complete los campos obligatorios.");
      return;
    }
    setSubmitting(true);
    onSubmitSolicitud({
      targetDate,
      durationDays,
      destination: destination.trim(),
      purpose: purpose.trim(),
      project: project.trim() || undefined,
      client: client.trim() || undefined
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 font-sans animate-in fade-in duration-300"
      style={{ zoom: appZoom }}
    >
      <div 
        className="bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Solicitar Préstamo de Activos</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Llene los detalles para la aprobación del administrador.</p>
          </div>
          <button 
            onClick={() => setShowSolicitudModal(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18}/>
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {/* Herramientas seleccionadas */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Herramientas Solicitadas ({selectedTools.length})</label>
              <div className="bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200/60 dark:border-slate-800/80 p-3 max-h-32 overflow-y-auto custom-scrollbar space-y-2">
                {selectedTools.map(t => (
                  <div key={t.id} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{t.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono">SN: {t.serial}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha de Uso */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Fecha de Uso *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Calendar size={15} />
                  </span>
                  <input 
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 bg-slate-50/50 dark:bg-slate-900/10 dark:text-slate-200 text-sm font-medium transition-all"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Duración (Días) */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Duración (Días) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Clock size={15} />
                  </span>
                  <input 
                    type="number"
                    required
                    min={1}
                    max={90}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 bg-slate-50/50 dark:bg-slate-900/10 dark:text-slate-200 text-sm font-medium transition-all"
                    value={durationDays}
                    onChange={e => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
              </div>
            </div>

            {/* Destino */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Destino / Lugar de Trabajo *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <MapPin size={15} />
                </span>
                <input 
                  type="text"
                  required
                  placeholder="Ej. Planta Orimec, Coca Codo Sinclair..."
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 bg-slate-50/50 dark:bg-slate-900/10 dark:text-slate-200 text-sm font-medium transition-all"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Proyecto */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Proyecto (Opcional)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Briefcase size={15} />
                  </span>
                  <input 
                    type="text"
                    placeholder="Nombre o ID del Proyecto"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 bg-slate-50/50 dark:bg-slate-900/10 dark:text-slate-200 text-sm font-medium transition-all"
                    value={project}
                    onChange={e => setProject(e.target.value)}
                  />
                </div>
              </div>

              {/* Cliente */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Cliente (Opcional)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User size={15} />
                  </span>
                  <input 
                    type="text"
                    placeholder="Nombre del Cliente"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 bg-slate-50/50 dark:bg-slate-900/10 dark:text-slate-200 text-sm font-medium transition-all"
                    value={client}
                    onChange={e => setClient(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Motivo del Préstamo */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Motivo del Préstamo / Uso *</label>
              <div className="relative">
                <span className="absolute top-3 left-3 text-slate-400">
                  <FileText size={15} />
                </span>
                <textarea 
                  required
                  rows={3}
                  placeholder="Describa brevemente para qué requiere las herramientas..."
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 bg-slate-50/50 dark:bg-slate-900/10 dark:text-slate-200 text-sm font-medium transition-all"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/10 shrink-0">
            <button
              type="button"
              onClick={() => setShowSolicitudModal(false)}
              disabled={submitting}
              className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-sm font-bold disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !destination.trim() || !purpose.trim()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
