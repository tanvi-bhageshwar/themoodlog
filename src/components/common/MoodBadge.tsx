import React from 'react';
import { MoodType } from '../../types';
import { Smile, Sparkles, Meh, CloudRain, Flame, Cloud, AlertCircle } from 'lucide-react';

interface MoodBadgeProps {
  mood: MoodType | string;
  intensity?: number;
  showIntensity?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const MOOD_META: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string; icon: React.FC<{ className?: string }> }
> = {
  happy: {
    label: 'Happy',
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    border: 'border-emerald-800/50',
    dot: 'bg-emerald-500',
    icon: Smile,
  },
  excited: {
    label: 'Excited',
    bg: 'bg-amber-950/40',
    text: 'text-amber-400',
    border: 'border-amber-800/50',
    dot: 'bg-amber-500',
    icon: Sparkles,
  },
  neutral: {
    label: 'Neutral',
    bg: 'bg-slate-900/60',
    text: 'text-slate-300',
    border: 'border-slate-700/50',
    dot: 'bg-slate-400',
    icon: Meh,
  },
  anxious: {
    label: 'Anxious',
    bg: 'bg-purple-950/40',
    text: 'text-purple-400',
    border: 'border-purple-800/50',
    dot: 'bg-purple-500',
    icon: CloudRain,
  },
  stressed: {
    label: 'Stressed',
    bg: 'bg-rose-950/40',
    text: 'text-rose-400',
    border: 'border-rose-800/50',
    dot: 'bg-rose-500',
    icon: Flame,
  },
  sad: {
    label: 'Sad',
    bg: 'bg-sky-950/40',
    text: 'text-sky-400',
    border: 'border-sky-800/50',
    dot: 'bg-sky-500',
    icon: Cloud,
  },
  angry: {
    label: 'Angry',
    bg: 'bg-red-950/40',
    text: 'text-red-400',
    border: 'border-red-800/50',
    dot: 'bg-red-500',
    icon: AlertCircle,
  },
};

export const MoodBadge: React.FC<MoodBadgeProps> = ({
  mood,
  intensity,
  showIntensity = false,
  size = 'md',
}) => {
  const normalized = (mood || 'neutral').toLowerCase();
  const meta = MOOD_META[normalized] || MOOD_META.neutral;
  const IconComponent = meta.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs font-medium gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-medium gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      id={`mood-badge-${normalized}`}
      className={`inline-flex items-center rounded-full border ${meta.bg} ${meta.text} ${meta.border} ${sizeClasses} whitespace-nowrap transition-colors`}
    >
      <IconComponent className={iconSizes} />
      <span>{meta.label}</span>
      {showIntensity && intensity !== undefined && (
        <span className="opacity-80 border-l border-current/25 pl-1 ml-0.5 font-semibold">
          {intensity}/10
        </span>
      )}
    </span>
  );
};
