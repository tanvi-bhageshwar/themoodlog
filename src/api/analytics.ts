import { api } from './client';
import { AnalyticsSummary, AnalyticsTrendsResponse, MoodDistributionItem } from '../types';

export const analyticsApi = {
  async getSummary(): Promise<AnalyticsSummary> {
    const res = await api.get<AnalyticsSummary>('/analytics/summary');
    return res.data;
  },

  async getTrends(): Promise<AnalyticsTrendsResponse> {
    const res = await api.get<AnalyticsTrendsResponse>('/analytics/trends');
    return res.data;
  },

  async getMoods(): Promise<MoodDistributionItem[]> {
    const res = await api.get<MoodDistributionItem[]>('/analytics/moods');
    return res.data;
  },
};
