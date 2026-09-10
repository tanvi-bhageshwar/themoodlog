export type MoodType =
  | 'happy'
  | 'sad'
  | 'anxious'
  | 'stressed'
  | 'angry'
  | 'excited'
  | 'neutral';

export type SentimentType = 'positive' | 'negative' | 'neutral';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface JournalEntry {
  id: number;
  user_id: number;
  content: string;
  mood: MoodType;
  intensity: number;
  confidence: number;
  ai_response: string;
  sentiment: SentimentType;
  is_distress: boolean;
  created_at: string;
  updated_at: string;
}

export interface JournalCreatePayload {
  content: string;
}

export interface JournalUpdatePayload {
  content: string;
}

export interface MoodDistributionItem {
  mood: MoodType;
  count: number;
  percentage: number;
  color: string;
}

export interface MoodTrendPoint {
  date: string;
  timestamp: string;
  mood: string;
  intensity: number;
  sentiment: string;
  entry_id: number;
}

export interface DailyActivity {
  date: string;
  count: number;
  average_intensity: number;
}

export interface AnalyticsSummary {
  total_entries: number;
  average_intensity: number;
  dominant_mood: MoodType | null;
  recent_mood: MoodType | null;
  entries_this_week: number;
  entries_this_month: number;
  current_streak_days: number;
  insights: string[];
}

export interface AnalyticsTrendsResponse {
  summary: AnalyticsSummary;
  distribution: MoodDistributionItem[];
  trend_points: MoodTrendPoint[];
  daily_history: DailyActivity[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}
