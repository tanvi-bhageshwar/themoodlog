import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { MoodDistributionItem } from '../../types';

interface MoodDistributionChartProps {
  data: MoodDistributionItem[];
}

export const MoodDistributionChart: React.FC<MoodDistributionChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-[#161b22] border border-[#30363d] rounded-2xl p-6 text-zinc-500 text-sm">
        <p>No mood logs recorded yet.</p>
        <p className="text-xs text-zinc-600 mt-1">Start journaling to visualize your emotional distribution.</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.mood.charAt(0).toUpperCase() + item.mood.slice(1),
    value: item.count,
    color: item.color,
    percentage: item.percentage,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-[#1c222b] border border-[#30363d] p-3 rounded-xl shadow-xl text-xs text-zinc-200">
          <div className="flex items-center gap-2 font-semibold">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: dataPoint.color }}
            />
            <span>{dataPoint.name}</span>
          </div>
          <div className="mt-1 text-zinc-400">
            {dataPoint.value} {dataPoint.value === 1 ? 'entry' : 'entries'} ({dataPoint.percentage}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="mood-distribution-chart"
      className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-md flex flex-col justify-between"
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-zinc-100">Emotional Balance</h3>
        <p className="text-xs text-zinc-400">Distribution across detected mood categories</p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#161b22" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-xs text-zinc-300 mr-2">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
