import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  badge?: React.ReactNode;
  accentColor?: 'amber' | 'emerald' | 'purple' | 'sky' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  badge,
  accentColor = 'amber',
}) => {
  const colorMap = {
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  }[accentColor];

  return (
    <div
      id={`stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-md flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-zinc-400 tracking-wide uppercase">{label}</span>
        <div className={`p-2 rounded-xl border ${colorMap}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">{value}</div>
        {badge && <div>{badge}</div>}
      </div>

      {subtext && <p className="text-[11px] text-zinc-500 mt-2 font-medium">{subtext}</p>}
    </div>
  );
};
