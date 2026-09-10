import React, { useState, useEffect, useCallback } from 'react';
import { journalApi } from '../api/journal';
import { JournalEntry, MoodType } from '../types';
import { EntryComposer } from '../components/journal/EntryComposer';
import { EntryCard } from '../components/journal/EntryCard';
import { EntryDetailModal } from '../components/journal/EntryDetailModal';
import { EditEntryModal } from '../components/journal/EditEntryModal';
import { DeleteConfirmModal } from '../components/journal/DeleteConfirmModal';
import { Skeleton } from '../components/common/Skeleton';
import {
  Search,
  Filter,
  ArrowUpDown,
  BookOpen,
  Plus,
  X,
} from 'lucide-react';

const MOOD_FILTERS: { label: string; value: string }[] = [
  { label: 'All Moods', value: '' },
  { label: 'Happy', value: 'happy' },
  { label: 'Excited', value: 'excited' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Anxious', value: 'anxious' },
  { label: 'Stressed', value: 'stressed' },
  { label: 'Sad', value: 'sad' },
  { label: 'Angry', value: 'angry' },
];

export const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Modals state
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<JournalEntry | null>(null);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await journalApi.getEntries({
        search: searchQuery.trim() || undefined,
        mood: selectedMood || undefined,
        sort_order: sortOrder,
      });
      setEntries(data);
    } catch {
      // Handled gracefully
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedMood, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEntries();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchEntries]);

  const handleEntryCreated = (newEntry: JournalEntry) => {
    setEntries((prev) => (sortOrder === 'newest' ? [newEntry, ...prev] : [...prev, newEntry]));
    setShowComposer(false);
  };

  const handleEntryUpdated = (updated: JournalEntry) => {
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    if (selectedEntry?.id === updated.id) setSelectedEntry(updated);
  };

  const handleEntryDeleted = (id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (selectedEntry?.id === id) setSelectedEntry(null);
  };

  return (
    <div id="journal-page" className="space-y-6 animate-in fade-in duration-200">
      {/* Header & New Entry CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#21262d]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            Journal History
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Search, filter, and review all your private reflections and emotional growth.
          </p>
        </div>

        <button
          id="journal-toggle-composer-button"
          onClick={() => setShowComposer(!showComposer)}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-semibold text-xs rounded-xl shadow-md transition-all active:scale-98"
        >
          {showComposer ? (
            <>
              <X className="w-4 h-4" />
              <span>Close Composer</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Write Reflection</span>
            </>
          )}
        </button>
      </div>

      {/* Expandable Composer */}
      {showComposer && (
        <div className="animate-in fade-in slide-in-from-top-3 duration-200">
          <EntryComposer onEntryCreated={handleEntryCreated} />
        </div>
      )}

      {/* Search, Mood Filters & Sort Controls */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="journal-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, thoughts, or reflections..."
              className="w-full bg-[#0d1117] border border-[#30363d] focus:border-amber-500/60 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <ArrowUpDown className="w-4 h-4 text-zinc-500" />
            <select
              id="journal-sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-amber-500/60"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Mood filter pill chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-thin">
          <Filter className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mr-1" />
          {MOOD_FILTERS.map((f) => (
            <button
              key={f.value}
              id={`filter-mood-${f.value || 'all'}`}
              onClick={() => setSelectedMood(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                selectedMood === f.value
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-[#0d1117] text-zinc-400 border-[#30363d] hover:text-zinc-200 hover:border-zinc-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Entries List or Grid */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-12 text-center text-zinc-400">
            <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-zinc-200">No journal entries found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedMood
                ? 'Try adjusting your search query or mood filter criteria.'
                : 'Your journal is empty. Click "Write Reflection" above to record your first entry.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onSelect={(e) => setSelectedEntry(e)}
                onEdit={(e) => setEditingEntry(e)}
                onDelete={(e) => setDeletingEntry(e)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <EntryDetailModal
        entry={selectedEntry}
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onEdit={(e) => setEditingEntry(e)}
        onDelete={(e) => setDeletingEntry(e)}
      />

      <EditEntryModal
        entry={editingEntry}
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        onUpdated={handleEntryUpdated}
      />

      <DeleteConfirmModal
        entry={deletingEntry}
        isOpen={!!deletingEntry}
        onClose={() => setDeletingEntry(null)}
        onDeleted={handleEntryDeleted}
      />
    </div>
  );
};
