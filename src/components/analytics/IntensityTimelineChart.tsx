import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { MoodTrendPoint } from '../../types';

interface IntensityTimelineChartProps {
  data: MoodTrendPoint[];
}

export const IntensityTimelineChart: React.FC<IntensityTimelineChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-[#161b22] border border-[#30363d] rounded-2xl p-6 text-zinc-500 text-sm">
        <p>No timeline data yet.</p>
        <p className="text-xs text-zinc-600 mt-1">Reflections recorded will map your intensity patterns over time.</p>
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: new Date(item.timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
    moodName: item.mood.charAt(0).toUpperCase() + item.mood.slice(1),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-[#1c222b] border border-[#30363d] p-3 rounded-xl shadow-xl text-xs text-zinc-200">
          <div className="font-semibold text-amber-400">{p.formattedDate}</div>
          <div className="mt-1 flex items-center justify-between gap-4">
            <span className="text-zinc-400">Intensity:</span>
            <span className="font-bold text-zinc-100">{p.intensity} / 10</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-zinc-400">Mood:</span>
            <span className="font-medium text-zinc-200">{p.moodName}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="intensity-timeline-chart"
      className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-md flex flex-col justify-between"
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">Emotional Intensity Over Time</h3>
          <p className="text-xs text-zinc-400">Scale from 1 (mild/subtle) to 10 (intense/overwhelming)</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          <span>Intensity (1-10)</span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="intensityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
            <XAxis
              dataKey="formattedDate"
              stroke="#6e7681"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[1, 10]}
              ticks={[2, 4, 6, 8, 10]}
              stroke="#6e7681"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="intensity"
              stroke="#f59e0b"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#intensityGradient)"
              dot={{ r: 3, fill: '#f59e0b', strokeWidth: 1, stroke: '#161b22' }}
              activeDot={{ r: 5, fill: '#fbbf24', stroke: '#161b22', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
