import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { journalApi } from '../api/journal';
import { analyticsApi } from '../api/analytics';
import { JournalEntry, AnalyticsTrendsResponse } from '../types';
import { EntryComposer } from '../components/journal/EntryComposer';
import { EntryCard } from '../components/journal/EntryCard';
import { EntryDetailModal } from '../components/journal/EntryDetailModal';
import { EditEntryModal } from '../components/journal/EditEntryModal';
import { DeleteConfirmModal } from '../components/journal/DeleteConfirmModal';
import { StatCard } from '../components/analytics/StatCard';
import { IntensityTimelineChart } from '../components/analytics/IntensityTimelineChart';
import { MoodBadge } from '../components/common/MoodBadge';
import { Skeleton } from '../components/common/Skeleton';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Flame,
  Activity,
  Heart,
  ArrowRight,
  BookOpen,
  PlusCircle,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [trends, setTrends] = useState<AnalyticsTrendsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<JournalEntry | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [entriesData, trendsData] = await Promise.all([
        journalApi.getEntries({ limit: 4, sort_order: 'newest' }),
        analyticsApi.getTrends(),
      ]);
      setEntries(entriesData);
      setTrends(trendsData);
    } catch {
      // Handled gracefully
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEntryCreated = (newEntry: JournalEntry) => {
    setEntries((prev) => [newEntry, ...prev.slice(0, 3)]);
    fetchData(); // Refresh analytics aggregations
  };

  const handleEntryUpdated = (updated: JournalEntry) => {
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    if (selectedEntry?.id === updated.id) setSelectedEntry(updated);
    fetchData();
  };

  const handleEntryDeleted = (id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (selectedEntry?.id === id) setSelectedEntry(null);
    fetchData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div id="dashboard-page" className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#21262d]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'friend'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Here is your mindful emotional landscape today. Take a breath and reflect.
          </p>
        </div>

        <Link
          to="/journal"
          id="dashboard-write-cta"
          className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-semibold text-xs rounded-xl shadow-md transition-all active:scale-98"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Write today's entry</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard
              label="Entries This Week"
              value={trends?.summary.entries_this_week ?? 0}
              subtext={`${trends?.summary.total_entries ?? 0} total in journal`}
              icon={CalendarDays}
              accentColor="amber"
            />
            <StatCard
              label="Average Intensity"
              value={
                trends?.summary.average_intensity
                  ? `${trends.summary.average_intensity} / 10`
                  : 'N/A'
              }
              subtext="Emotional depth score"
              icon={Activity}
              accentColor="sky"
            />
            <StatCard
              label="Dominant Mood"
              value={
                trends?.summary.dominant_mood ? (
                  <span className="capitalize text-lg sm:text-xl">
                    {trends.summary.dominant_mood}
                  </span>
                ) : (
                  'Calm'
                )
              }
              subtext={trends?.summary.dominant_mood ? 'Most frequent state' : 'Log entries to track'}
              icon={Heart}
              accentColor="purple"
              badge={
                trends?.summary.dominant_mood && (
                  <MoodBadge mood={trends.summary.dominant_mood} size="sm" />
                )
              }
            />
            <StatCard
              label="Current Streak"
              value={`${trends?.summary.current_streak_days ?? 0} days`}
              subtext="Consecutive days active"
              icon={Flame}
              accentColor="emerald"
            />
          </>
        )}
      </div>

      {/* Quick Journal Composer */}
      <EntryComposer onEntryCreated={handleEntryCreated} compact={false} />

      {/* Interactive Trend Chart */}
      <div>
        {isLoading ? (
          <Skeleton className="h-72" />
        ) : (
          <IntensityTimelineChart data={trends?.trend_points || []} />
        )}
      </div>

      {/* Recent Entries Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">Recent Reflections</h2>
            <p className="text-xs text-zinc-400">Your latest entries and empathetic AI notes</p>
          </div>
          <Link
            to="/journal"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            <span>View all entries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 text-center text-zinc-400">
            <BookOpen className="w-10 h-10 text-zinc-600 mx-auto mb-2.5" />
            <h3 className="text-sm font-semibold text-zinc-200">No reflections logged yet</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Use the composer above to begin recording your thoughts. You'll receive mindful reflections and emotional insights.
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

      {/* Detail, Edit & Delete Modals */}
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
