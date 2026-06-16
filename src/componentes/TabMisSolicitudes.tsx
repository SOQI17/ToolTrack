import React, { useState } from 'react';
import { Calendar, Clock, MapPin, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import type { LoanRequest } from '../tipos';

interface TabMisSolicitudesProps {
  loanRequests: LoanRequest[];
  currentUserUid: string;
}

export const TabMisSolicitudes: React.FC<TabMisSolicitudesProps> = ({
  loanRequests,
  currentUserUid
}) => {
  const [filter, setFilter] = useState<'ALL' | 'pending' | 'resolved'>('ALL');

  // Filter requests belonging to this engineer
  const myRequests = loanRequests.filter(r => r.engineerUid === currentUserUid);

  const filteredRequests = myRequests.filter(r => {
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'resolved') return r.status !== 'pending';
    return true;
  }).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold dm-text tracking-tight">Mis Solicitudes</h2>
          <p className="text-xs dm-text3 mt-1">Historial y estado de tus requerimientos de herramientas</p>
        </div>
        <div className="flex bg-slate-100/70 dark:bg-slate-900/40 p-1 rounded-xl w-full md:w-auto border dm-border">
          {(['ALL', 'pending', 'resolved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex-1 md:flex-none ${
                filter === f
                  ? 'bg-white dark:bg-[#1a1f2e] text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/50 dark:border-slate-800/60'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {f === 'ALL' 
                ? `Todas (${myRequests.length})` 
                : f === 'pending' 
                  ? `Pendientes (${myRequests.filter(r => r.status === 'pending').length})` 
                  : `Resueltas (${myRequests.filter(r => r.status !== 'pending').length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRequests.map(req => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';
            const isRejected = req.status === 'rejected';

            return (
              <div 
                key={req.id} 
                className="dm-surface border dm-border p-5 rounded-2xl shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Cabecera de la tarjeta */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] dm-text3 font-mono">Solicitado: {new Date(req.requestDate).toLocaleDateString()}</span>
                    </div>
                    
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${
                      isPending 
                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                        : isApproved 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {isPending && <AlertCircle size={10}/>}
                      {isApproved && <CheckCircle size={10}/>}
                      {isRejected && <XCircle size={10}/>}
                      {isPending ? 'Pendiente' : isApproved ? 'Aprobado' : 'Rechazado'}
                    </span>
                  </div>

                  {/* Lista de herramientas solicitadas */}
                  <div>
                    <p className="text-[9px] font-bold dm-text3 uppercase tracking-wider mb-2">Herramientas ({req.tools.length})</p>
                    <div className="dm-surface2 border dm-border p-3 rounded-xl max-h-24 overflow-y-auto custom-scrollbar space-y-1.5">
                      {req.tools.map(t => (
                        <div key={t.id} className="flex justify-between items-center text-[11px] leading-tight">
                          <span className="font-bold dm-text">{t.name}</span>
                          <span className="text-[9px] font-bold dm-text3 font-mono">SN: {t.serial}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detalles de la fecha, duración, destino */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                    <div className="flex items-center gap-2 dm-text2">
                      <Calendar size={14} className="dm-text3 shrink-0"/>
                      <div>
                        <p className="text-[9px] font-bold dm-text3 uppercase leading-none mb-0.5">Fecha de Uso</p>
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
                    <div className="col-span-2 flex items-start gap-2 dm-text2">
                      <FileText size={14} className="dm-text3 shrink-0 mt-0.5"/>
                      <div>
                        <p className="text-[9px] font-bold dm-text3 uppercase leading-none mb-0.5">Motivo</p>
                        <p className="font-medium leading-relaxed dm-text2">{req.purpose}</p>
                      </div>
                    </div>
                  </div>

                  {/* Estado de la resolución */}
                  {!isPending && (
                    <div className="pt-3 border-t dm-border space-y-1.5 text-xs bg-slate-50/50 dark:bg-slate-900/10 p-3 rounded-xl">
                      <div className="flex justify-between">
                        <span className="dm-text3">Resuelto por:</span>
                        <span className="font-bold dm-text">{req.resolvedBy || 'Administrador'}</span>
                      </div>
                      {req.resolvedAt && (
                        <div className="flex justify-between">
                          <span className="dm-text3">Fecha:</span>
                          <span className="font-medium dm-text2">{new Date(req.resolvedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      {isRejected && req.rejectionReason && (
                        <div className="flex flex-col gap-1 mt-2 p-2 bg-red-500/5 rounded-lg border border-red-500/10 text-red-500">
                          <span className="text-[9px] font-bold uppercase tracking-wider">Motivo de Rechazo:</span>
                          <p className="text-[11px] font-medium leading-normal">{req.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {filteredRequests.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl border-2 border-dashed dm-border">
              {myRequests.length === 0 
                ? 'Aún no has realizado ninguna solicitud de herramientas.' 
                : `No tienes solicitudes ${filter === 'pending' ? 'pendientes' : 'resueltas'}.`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
