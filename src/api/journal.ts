import { api } from './client';
import { JournalEntry, JournalCreatePayload, JournalUpdatePayload } from '../types';

export const journalApi = {
  async getEntries(params?: {
    search?: string;
    mood?: string;
    start_date?: string;
    end_date?: string;
    sort_order?: 'newest' | 'oldest';
    limit?: number;
    offset?: number;
  }): Promise<JournalEntry[]> {
    const res = await api.get<JournalEntry[]>('/entries', { params });
    return res.data;
  },

  async getEntry(id: number): Promise<JournalEntry> {
    const res = await api.get<JournalEntry>(`/entries/${id}`);
    return res.data;
  },

  async createEntry(payload: JournalCreatePayload): Promise<JournalEntry> {
    const res = await api.post<JournalEntry>('/entries', payload);
    return res.data;
  },

  async updateEntry(id: number, payload: JournalUpdatePayload): Promise<JournalEntry> {
    const res = await api.put<JournalEntry>(`/entries/${id}`, payload);
    return res.data;
  },

  async deleteEntry(id: number): Promise<{ message: string; id: number }> {
    const res = await api.delete<{ message: string; id: number }>(`/entries/${id}`);
    return res.data;
  },
};
