import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../api/analytics';
import { AnalyticsTrendsResponse } from '../types';
import { StatCard } from '../components/analytics/StatCard';
import { MoodDistributionChart } from '../components/analytics/MoodDistributionChart';
import { IntensityTimelineChart } from '../components/analytics/IntensityTimelineChart';
import { InsightsList } from '../components/analytics/InsightsList';
import { MoodBadge } from '../components/common/MoodBadge';
import { Skeleton } from '../components/common/Skeleton';
import {
  BarChart3,
  CalendarDays,
  Flame,
  Activity,
  Heart,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [trends, setTrends] = useState<AnalyticsTrendsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await analyticsApi.getTrends();
        setTrends(data);
      } catch {
        // Handled
      } finally {
        setIsLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  return (
    <div id="analytics-page" className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-2 border-b border-[#21262d]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Longitudinal Emotional Analysis</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
          Mindful Analytics & Trends
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Observe your mood patterns, intensity variations, and longitudinal journaling metrics over time.
        </p>
      </div>

      {/* Summary KPI Grid */}
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
              label="Total Reflections"
              value={trends?.summary.total_entries ?? 0}
              subtext={`${trends?.summary.entries_this_month ?? 0} logged this month`}
              icon={BarChart3}
              accentColor="amber"
            />
            <StatCard
              label="Weekly Frequency"
              value={trends?.summary.entries_this_week ?? 0}
              subtext="Entries in past 7 days"
              icon={CalendarDays}
              accentColor="sky"
            />
            <StatCard
              label="Average Intensity"
              value={
                trends?.summary.average_intensity
                  ? `${trends.summary.average_intensity} / 10`
                  : 'N/A'
              }
              subtext="Aggregated emotional volume"
              icon={Activity}
              accentColor="purple"
            />
            <StatCard
              label="Current Streak"
              value={`${trends?.summary.current_streak_days ?? 0} days`}
              subtext="Consistent mindful habit"
              icon={Flame}
              accentColor="emerald"
            />
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </>
        ) : (
          <>
            <IntensityTimelineChart data={trends?.trend_points || []} />
            <MoodDistributionChart data={trends?.distribution || []} />
          </>
        )}
      </div>

      {/* Data-driven Insights & Non-clinical Reflection */}
      <div>
        {isLoading ? (
          <Skeleton className="h-44" />
        ) : (
          <InsightsList insights={trends?.summary.insights || []} />
        )}
      </div>
    </div>
  );
};
