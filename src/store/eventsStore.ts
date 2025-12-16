import { create } from 'zustand';
import { Event } from '@/types/api';
import { apiClient } from '@/services/api';

interface EventsState {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  refreshEvents: () => Promise<void>;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  loading: false,
  error: null,
  fetchEvents: async () => {
    if (get().loading) return;
    
    set({ loading: true, error: null });
    try {
      console.log('Fetching events...');
      const events = await apiClient.getEvents();
      console.log('Events fetched:', events.length);
      set({ events, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch events';
      console.error('Error in fetchEvents:', errorMessage);
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },
  refreshEvents: async () => {
    set({ loading: true, error: null });
    try {
      const events = await apiClient.getEvents();
      set({ events, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to refresh events',
        loading: false,
      });
    }
  },
}));

