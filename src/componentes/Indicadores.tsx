import React from 'react';
import type { ToolStatus, ABCCategory } from '../tipos';

interface BadgeEstadoProps {
  status: ToolStatus;
}

export const BadgeEstado: React.FC<BadgeEstadoProps> = ({ status }) => {
  const config = {
    'available': { color: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20', text: 'Disponible' },
    'in-use': { color: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20', text: 'En Uso' },
    'maintenance': { color: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20', text: 'Mantenimiento' },
    'broken': { color: 'bg-red-50 text-red-700 ring-1 ring-red-600/20', text: 'Dañado' }
  };
  const c = config[status] || { color: 'bg-slate-50 text-slate-700 ring-1 ring-slate-600/20', text: 'Desconocido' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${c.color} whitespace-nowrap`}>
      {c.text}
    </span>
  );
};

interface BadgeABCProps {
  category?: ABCCategory;
}

const abcTips: Record<string, string> = {
  A: 'Clase A: Alta criticidad — calibración periódica obligatoria',
  B: 'Clase B: Criticidad media — mantenimiento preventivo',
  C: 'Clase C: Uso estándar — mantenimiento correctivo'
};

export const BadgeABC: React.FC<BadgeABCProps> = ({ category }) => {
  if (!category) return <span className="text-slate-400">-</span>;
  const colors = {
    'A': 'bg-purple-50 text-purple-700 ring-1 ring-purple-500/20',
    'B': 'bg-blue-50 text-blue-700 ring-1 ring-blue-500/20',
    'C': 'bg-slate-50 text-slate-700 ring-1 ring-slate-500/20'
  };
  return (
    <span
      title={abcTips[category]}
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${colors[category]} uppercase tracking-wider whitespace-nowrap cursor-help`}
    >
      Clase {category}
    </span>
  );
};
