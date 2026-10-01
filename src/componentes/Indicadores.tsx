import React from 'react';
import type { ToolStatus, ABCCategory } from '../tipos';

interface BadgeEstadoProps {
  status: ToolStatus;
  condition?: string;
}

export const BadgeEstado: React.FC<BadgeEstadoProps> = ({ status, condition }) => {
  const normalizeText = (t?: string) => {
    if (!t) return '';
    return t
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  if (normalizeText(condition) === 'fuera de servicio') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 ring-1 ring-red-600/20 dark:ring-red-500/30 whitespace-nowrap">
        Fuera de servicio
      </span>
    );
  }

  const config = {
    'available': { 
      color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-600/20 dark:ring-emerald-500/30', 
      text: 'Disponible' 
    },
    'in-use': { 
      color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 ring-1 ring-blue-600/20 dark:ring-blue-500/30', 
      text: 'En Uso' 
    },
    'maintenance': { 
      color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 ring-1 ring-amber-600/20 dark:ring-amber-500/30', 
      text: 'Mantenimiento' 
    },
    'broken': { 
      color: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 ring-1 ring-red-600/20 dark:ring-red-500/30', 
      text: 'Dañado' 
    }
  };
  const c = config[status] || { color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 ring-1 ring-slate-400/20 dark:ring-slate-700', text: 'Desconocido' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${c.color} whitespace-nowrap`}>
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
    'A': 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500/20 dark:ring-purple-400/30',
    'B': 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/20 dark:ring-blue-400/30',
    'C': 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 ring-1 ring-slate-500/20 dark:ring-slate-700'
  };
  return (
    <span
      title={abcTips[category]}
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${colors[category]} uppercase tracking-wider whitespace-nowrap cursor-help`}
    >
      Clase {category}
    </span>
  );
};
