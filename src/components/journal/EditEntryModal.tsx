import React, { useState, useEffect } from 'react';
import { JournalEntry } from '../../types';
import { Modal } from '../common/Modal';
import { journalApi } from '../../api/journal';
import { useToast } from '../../context/ToastContext';
import { Loader2, Save } from 'lucide-react';

interface EditEntryModalProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (entry: JournalEntry) => void;
}

export const EditEntryModal: React.FC<EditEntryModalProps> = ({
  entry,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (entry) {
      setContent(entry.content);
    }
  }, [entry]);

  if (!entry) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = content.trim();
    if (clean.length < 3) {
      showToast('Reflection content must be at least 3 characters.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await journalApi.updateEntry(entry.id, { content: clean });
      onUpdated(updated);
      showToast('Entry revised and emotional tone re-analyzed.', 'success');
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to update reflection.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Revise Reflection" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="edit-entry-textarea" className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Journal Content
          </label>
          <textarea
            id="edit-entry-textarea"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-500/60 rounded-xl p-3.5 text-sm text-zinc-200 resize-none outline-none leading-relaxed disabled:opacity-60"
            placeholder="Edit your journal reflection..."
          />
          <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
            <span>Updating will automatically refresh emotional tone analysis.</span>
            <span className="font-mono">{content.length} chars</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#21262d]">
          <button
            type="button"
            id="edit-cancel-button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="edit-save-button"
            disabled={isSubmitting || content.trim().length < 3}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-semibold text-xs rounded-xl shadow-md transition-all disabled:opacity-40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Re-analyzing...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
