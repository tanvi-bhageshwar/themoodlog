import React from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';

interface InsightsListProps {
  insights: string[];
}

export const InsightsList: React.FC<InsightsListProps> = ({ insights }) => {
  return (
    <div
      id="analytics-insights-card"
      className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-md"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">Personal Reflections & Patterns</h3>
          <p className="text-xs text-zinc-400">Automated observations grounded directly in your logs</p>
        </div>
      </div>

      <div className="space-y-2.5 mt-4">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-xl bg-[#0d1117] border border-[#21262d] text-xs text-zinc-300 leading-relaxed"
          >
            <Sparkles className="w-4 h-4 text-amber-400/80 flex-shrink-0 mt-0.5" />
            <span>{insight}</span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-zinc-500 italic mt-3 pt-3 border-t border-[#21262d]">
        Disclaimer: MoodLog insights are informational journaling reflections, not clinical psychological assessments.
      </p>
    </div>
  );
};
