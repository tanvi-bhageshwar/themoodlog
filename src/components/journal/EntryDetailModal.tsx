import React from 'react';
import { JournalEntry } from '../../types';
import { Modal } from '../common/Modal';
import { MoodBadge } from '../common/MoodBadge';
import { DistressBanner } from '../common/DistressBanner';
import { Calendar, Clock, Sparkles, Edit2, Trash2, ShieldCheck } from 'lucide-react';

interface EntryDetailModalProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entry: JournalEntry) => void;
}

export const EntryDetailModal: React.FC<EntryDetailModalProps> = ({
  entry,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!entry) return null;

  const formattedDate = new Date(entry.created_at).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(entry.created_at).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Journal Reflection" maxWidth="lg">
      <div id="entry-detail-view" className="space-y-4">
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#21262d]">
          <div className="flex items-center gap-2">
            <MoodBadge mood={entry.mood} intensity={entry.intensity} showIntensity size="md" />
            <span className="text-xs text-zinc-500 font-mono">
              Confidence: {Math.round(entry.confidence * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formattedTime}
            </span>
          </div>
        </div>

        {/* Safety Distress Banner if flagged */}
        {entry.is_distress && <DistressBanner />}

        {/* User Journal Text */}
        <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4 text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
          {entry.content}
        </div>

        {/* AI Empathetic Reflection */}
        <div className="bg-gradient-to-br from-[#1c222b] to-[#161b22] border border-amber-500/20 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400 mb-2">
            <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Empathetic Reflection</span>
            </div>
            <span className="text-[11px] text-zinc-500 font-normal">Non-clinical companion</span>
          </div>
          <p className="text-sm text-zinc-200 italic leading-relaxed">
            "{entry.ai_response}"
          </p>
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#21262d]">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Encrypted & scoped to your private account</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="detail-edit-button"
              onClick={() => {
                onClose();
                onEdit(entry);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-zinc-200 text-xs font-medium rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              id="detail-delete-button"
              onClick={() => {
                onClose();
                onDelete(entry);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-medium rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
