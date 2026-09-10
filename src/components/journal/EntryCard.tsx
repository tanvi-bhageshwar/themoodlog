import React from 'react';
import { JournalEntry } from '../../types';
import { MoodBadge } from '../common/MoodBadge';
import { Calendar, Clock, Edit2, Trash2, Sparkles, AlertTriangle } from 'lucide-react';

interface EntryCardProps {
  entry: JournalEntry;
  onSelect: (entry: JournalEntry) => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entry: JournalEntry) => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const formattedDate = new Date(entry.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(entry.created_at).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article
      id={`entry-card-${entry.id}`}
      onClick={() => onSelect(entry)}
      className="group bg-[#161b22] hover:bg-[#1c222b] border border-[#30363d] hover:border-amber-500/30 rounded-2xl p-5 shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Header: Date, Mood Badge, Actions */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <MoodBadge mood={entry.mood} intensity={entry.intensity} showIntensity size="sm" />
            {entry.is_distress && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-rose-950/60 text-rose-300 border border-rose-800/50 px-2 py-0.5 rounded-full font-medium">
                <AlertTriangle className="w-3 h-3" />
                Support Flag
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              id={`entry-edit-btn-${entry.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(entry);
              }}
              className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-[#21262d] rounded-lg transition-colors"
              title="Edit entry"
              aria-label="Edit entry"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              id={`entry-delete-btn-${entry.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(entry);
              }}
              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-[#21262d] rounded-lg transition-colors"
              title="Delete entry"
              aria-label="Delete entry"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <p className="text-sm text-zinc-200 line-clamp-3 leading-relaxed mb-3">
          {entry.content}
        </p>

        {/* AI Reflection Snippet */}
        <div className="bg-[#0d1117]/60 border border-[#21262d] rounded-xl p-2.5 mb-3 text-xs text-zinc-400 italic">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-400/80 uppercase tracking-wider mb-0.5 not-italic">
            <Sparkles className="w-2.5 h-2.5" />
            <span>AI Reflection</span>
          </div>
          <p className="line-clamp-2">"{entry.ai_response}"</p>
        </div>
      </div>

      {/* Footer: Timestamp */}
      <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-2 border-t border-[#21262d]">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formattedDate}
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formattedTime}
        </span>
      </div>
    </article>
  );
};
