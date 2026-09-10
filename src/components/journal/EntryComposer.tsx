import React, { useState } from 'react';
import { journalApi } from '../../api/journal';
import { JournalEntry } from '../../types';
import { MoodBadge } from '../common/MoodBadge';
import { DistressBanner } from '../common/DistressBanner';
import { useToast } from '../../context/ToastContext';
import { Send, Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface EntryComposerProps {
  onEntryCreated: (entry: JournalEntry) => void;
  compact?: boolean;
}

export const EntryComposer: React.FC<EntryComposerProps> = ({ onEntryCreated, compact = false }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<JournalEntry | null>(null);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = content.trim();
    if (clean.length < 3) {
      showToast('Please write at least a few words to reflect on.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const entry = await journalApi.createEntry({ content: clean });
      setLatestAnalysis(entry);
      setContent('');
      onEntryCreated(entry);
      showToast('Journal entry saved and analyzed.', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to save reflection. Please try again.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="journal-composer"
      className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              {compact ? 'Quick Reflection' : 'How are you feeling right now?'}
            </h2>
            <p className="text-xs text-zinc-400">Write freely. AI will analyze your emotional tone and offer a mindful reflection.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            id="journal-composer-textarea"
            rows={compact ? 3 : 4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            placeholder="Today I felt... What made this day meaningful, challenging, or unexpected?"
            className="w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 rounded-xl p-3.5 text-sm text-zinc-200 placeholder-zinc-500 resize-none transition-colors outline-none leading-relaxed disabled:opacity-60"
          />
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-zinc-500 font-mono">
            {content.length} characters
          </span>

          <button
            type="submit"
            id="journal-composer-submit-button"
            disabled={isSubmitting || content.trim().length < 3}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-semibold text-xs rounded-xl shadow-md transition-all active:scale-98"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Reflecting on your entry...</span>
              </>
            ) : (
              <>
                <span>Record & Reflect</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Immediate Interactive AI Reflection Card after saving */}
      {latestAnalysis && (
        <div
          id="latest-reflection-card"
          className="mt-5 pt-4 border-t border-[#30363d] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400">Analyzed Mood:</span>
              <MoodBadge mood={latestAnalysis.mood} intensity={latestAnalysis.intensity} showIntensity size="sm" />
            </div>
            <button
              onClick={() => setLatestAnalysis(null)}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Dismiss
            </button>
          </div>

          {latestAnalysis.is_distress && <DistressBanner />}

          <div className="bg-[#0d1117]/80 border border-amber-500/20 rounded-xl p-3.5 mt-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/90 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>AI Mindful Reflection</span>
            </div>
            <p className="text-xs text-zinc-300 italic leading-relaxed">
              "{latestAnalysis.ai_response}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
