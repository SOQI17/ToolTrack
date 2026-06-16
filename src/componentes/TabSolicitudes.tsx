import React, { useState } from 'react';
import { Clock, Check, X, MapPin, Calendar, FileText, User, MessageSquare } from 'lucide-react';
import type { LoanRequest } from '../tipos';

interface TabSolicitudesProps {
  loanRequests: LoanRequest[];
  onApprove: (req: LoanRequest) => Promise<void>;
  onReject: (req: LoanRequest, reason: string) => Promise<void>;
}

export const TabSolicitudes: React.FC<TabSolicitudesProps> = ({
  loanRequests,
  onApprove,
  onReject
}) => {
  const [filter, setFilter] = useState<'pending' | 'resolved'>('pending');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null); // req.id

  const filteredRequests = loanRequests.filter(r => 
    filter === 'pending' ? r.status === 'pending' : r.status !== 'pending'
  ).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

  const handleApprove = async (req: LoanRequest) => {
    setActionLoading(req.id);
    try {
      await onApprove(req);
    } catch (e) {
      alert("Error al aprobar: " + e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent, req: LoanRequest) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return alert("Por favor ingrese un motivo de rechazo.");
    setActionLoading(req.id);
    try {
      await onReject(req, rejectionReason.trim());
      setRejectingId(null);
      setRejectionReason('');
    } catch (e) {
      alert("Error al rechazar: " + e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold dm-text tracking-tight">Solicitudes de Préstamos</h2>
        </div>
        <div className="flex bg-slate-100/70 dark:bg-slate-900/40 p-1 rounded-xl w-full md:w-auto border dm-border">
          {(['pending', 'resolved'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setRejectingId(null); }}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-all flex-1 md:flex-none ${
                filter === f
                  ? 'bg-white dark:bg-[#1a1f2e] text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-800/60'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {f === 'pending' 
                ? `Pendientes (${loanRequests.filter(r => r.status === 'pending').length})` 
                : `Resueltas (${loanRequests.filter(r => r.status !== 'pending').length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRequests.map(req => (
            <div 
              key={req.id} 
              className="dm-surface border dm-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Solicitud */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500/10 to-blue-600/20 border dm-border flex items-center justify-center dm-text font-black text-sm shrink-0">
                      {req.engineerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold dm-text text-sm leading-tight">{req.engineerName}</h4>
                      <p className="text-[10px] dm-text3 mt-0.5 font-mono">Solicitado: {new Date(req.requestDate).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    req.status === 'pending' 
                      ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                      : req.status === 'approved' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {req.status === 'pending' ? 'Pendiente' : req.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                  </span>
                </div>

                {/* Detalles del Préstamo */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 dm-text2">
                    <Calendar size={14} className="dm-text3 shrink-0"/>
                    <div>
                      <p className="text-[9px] font-bold dm-text3 uppercase leading-none mb-0.5">Uso previsto</p>
                      <p className="font-semibold">{new Date(req.targetDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 dm-text2">
                    <Clock size={14} className="dm-text3 shrink-0"/>
                    <div>
                      <p className="text-[9px] font-bold dm-text3 uppercase leading-none mb-0.5">Duración</p>
                      <p className="font-semibold">{req.durationDays} día{req.durationDays !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-start gap-2 dm-text2">
                    <MapPin size={14} className="dm-text3 shrink-0 mt-0.5"/>
                    <div>
                      <p className="text-[9px] font-bold dm-text3 uppercase leading-none mb-0.5">Destino</p>
                      <p className="font-semibold leading-tight">{req.destination}</p>
                    </div>
                  </div>
                  {req.project && (
                    <div className="col-span-2 md:col-span-1 flex items-start gap-2 dm-text2">
                      <User size={14} className="dm-text3 shrink-0 mt-0.5"/>
                      <div>
                        <p className="text-[9px] font-bold dm-text3 uppercase leading-none mb-0.5">Proyecto / Cliente</p>
                        <p className="font-semibold leading-tight truncate">{req.project} {req.client ? `(${req.client})` : ''}</p>
                      </div>
                    </div>
                  )}
                  <div className="col-span-2 flex items-start gap-2 dm-text2">
                    <FileText size={14} className="dm-text3 shrink-0 mt-0.5"/>
                    <div>
                      <p className="text-[9px] font-bold dm-text3 uppercase leading-none mb-0.5">Motivo / Detalle</p>
                      <p className="font-medium leading-relaxed dm-text2">{req.purpose}</p>
                    </div>
                  </div>
                </div>

                {/* Lista de Herramientas */}
                <div>
                  <p className="text-[9px] font-bold dm-text3 uppercase tracking-wider mb-2">Herramientas Solicitadas ({req.tools.length})</p>
                  <div className="dm-surface2 border dm-border p-3 rounded-xl max-h-24 overflow-y-auto custom-scrollbar space-y-1.5">
                    {req.tools.map(t => (
                      <div key={t.id} className="flex justify-between items-center text-[11px] leading-tight">
                        <span className="font-bold dm-text">{t.name}</span>
                        <span className="text-[9px] font-bold dm-text3 font-mono">SN: {t.serial}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detalles de Resolución */}
                {req.status !== 'pending' && (
                  <div className="pt-3 border-t dm-border space-y-1.5 text-xs bg-slate-50/50 dark:bg-slate-900/10 p-3 rounded-xl">
                    <div className="flex justify-between">
                      <span className="dm-text3">Resuelto por:</span>
                      <span className="font-bold dm-text">{req.resolvedBy || 'Desconocido'}</span>
                    </div>
                    {req.resolvedAt && (
                      <div className="flex justify-between">
                        <span className="dm-text3">Fecha:</span>
                        <span className="font-medium dm-text2">{new Date(req.resolvedAt).toLocaleString()}</span>
                      </div>
                    )}
                    {req.status === 'rejected' && req.rejectionReason && (
                      <div className="flex items-start gap-1.5 mt-2 bg-red-500/5 p-2 rounded-lg border border-red-500/10 text-red-500">
                        <MessageSquare size={12} className="shrink-0 mt-0.5"/>
                        <p className="text-[11px] font-medium leading-normal"><strong className="font-bold">Motivo:</strong> {req.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botones de Acción */}
              {req.status === 'pending' && (
                <div className="mt-5 pt-4 border-t dm-border flex flex-col gap-3">
                  {rejectingId === req.id ? (
                    <form onSubmit={(e) => handleApprove(req)} className="space-y-3">
                      {/* Formulario de Rechazo */}
                    </form>
                  ) : null}

                  {rejectingId === req.id ? (
                    <form onSubmit={(e) => handleRejectSubmit(e, req)} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold dm-text3 uppercase mb-1">Motivo de Rechazo *</label>
                        <input 
                          type="text"
                          required
                          placeholder="Ingrese por qué se rechaza..."
                          className="w-full px-3 py-2 text-xs border dm-border rounded-lg outline-none focus:border-blue-500 dm-surface dm-text"
                          value={rejectionReason}
                          onChange={e => setRejectionReason(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                          disabled={actionLoading !== null}
                          className="px-3 py-1.5 border dm-border dm-text3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 font-bold transition-all"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={actionLoading !== null || !rejectionReason.trim()}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold transition-all flex items-center justify-center gap-1"
                        >
                          {actionLoading === req.id ? (
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : 'Confirmar Rechazo'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex justify-end gap-2.5 text-xs font-bold">
                      <button
                        onClick={() => setRejectingId(req.id)}
                        disabled={actionLoading !== null}
                        className="px-4 py-2 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500/10 transition-all flex items-center gap-1"
                      >
                        <X size={14}/> Rechazar
                      </button>
                      <button
                        onClick={() => handleApprove(req)}
                        disabled={actionLoading !== null}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center gap-1"
                      >
                        {actionLoading === req.id ? (
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Check size={14}/> Aprobar Préstamo
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {filteredRequests.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl border-2 border-dashed dm-border">
              No hay solicitudes {filter === 'pending' ? 'pendientes' : 'resueltas'} en este momento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
