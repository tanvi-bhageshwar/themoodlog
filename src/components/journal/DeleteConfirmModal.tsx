import React, { useState } from 'react';
import { JournalEntry } from '../../types';
import { Modal } from '../common/Modal';
import { journalApi } from '../../api/journal';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (entryId: number) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  entry,
  isOpen,
  onClose,
  onDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  if (!entry) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await journalApi.deleteEntry(entry.id);
      onDeleted(entry.id);
      showToast('Journal entry deleted.', 'info');
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to delete entry.';
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion" maxWidth="sm">
      <div className="space-y-3 text-sm text-zinc-300">
        <div className="flex items-center gap-3 p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl text-rose-300">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <p className="text-xs leading-relaxed">
            Are you sure you want to permanently delete this journal entry from your private history?
          </p>
        </div>

        <div className="p-3 bg-[#0d1117] rounded-xl border border-[#21262d] text-xs text-zinc-400 italic line-clamp-2">
          "{entry.content}"
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#21262d]">
          <button
            type="button"
            id="delete-cancel-button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="delete-confirm-button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Entry</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
