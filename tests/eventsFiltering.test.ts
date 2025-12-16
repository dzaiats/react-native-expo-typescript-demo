import { Event } from '@/types/api';

// Mock the filtering and sorting logic from EventsListScreen
// This is the same logic used in the component
const filterAndSortEvents = (
  events: Event[],
  searchQuery: string,
  sortBy: 'date' | 'title'
): Event[] => {
  let filtered = events;

  // Filter by search query
  const trimmedQuery = searchQuery.trim();
  if (trimmedQuery) {
    const lowerQuery = trimmedQuery.toLowerCase();
    filtered = filtered.filter(
      (event) =>
        event.title?.toLowerCase().includes(lowerQuery) ||
        event.location?.toLowerCase().includes(lowerQuery)
    );
  }

  // Sort events
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return dateB - dateA; // Newest first
    } else {
      return (a.title || '').localeCompare(b.title || '');
    }
  });

  return filtered;
};

describe('Events Filtering and Sorting', () => {
  const mockEvents: Event[] = [
    {
      id: 1,
      sqid: 'event-1',
      name: 'Concert A',
      title: 'Concert A',
      startDate: '2025-01-15T10:00:00Z',
      location: 'Venue A',
    },
    {
      id: 2,
      sqid: 'event-2',
      name: 'Festival B',
      title: 'Festival B',
      startDate: '2025-03-20T14:00:00Z',
      location: 'Venue B',
    },
    {
      id: 3,
      sqid: 'event-3',
      name: 'Show C',
      title: 'Show C',
      startDate: '2025-02-10T18:00:00Z',
      location: 'Venue C',
    },
    {
      id: 4,
      sqid: 'event-4',
      name: 'Concert D',
      title: 'Concert D',
      startDate: '2025-04-05T12:00:00Z',
      location: 'Venue A',
    },
  ];

  describe('Filtering', () => {
    it('should return all events when search query is empty', () => {
      const result = filterAndSortEvents(mockEvents, '', 'date');
      expect(result).toHaveLength(4);
      expect(result).toEqual(expect.arrayContaining(mockEvents));
    });

    it('should filter events by title', () => {
      const result = filterAndSortEvents(mockEvents, 'Concert', 'date');
      expect(result).toHaveLength(2);
      expect(result.every((e) => e.title?.includes('Concert'))).toBe(true);
    });

    it('should filter events by location', () => {
      const result = filterAndSortEvents(mockEvents, 'Venue A', 'date');
      expect(result).toHaveLength(2);
      expect(result.every((e) => e.location === 'Venue A')).toBe(true);
    });

    it('should be case insensitive', () => {
      const result = filterAndSortEvents(mockEvents, 'concert', 'date');
      expect(result).toHaveLength(2);
      expect(result.every((e) => e.title?.toLowerCase().includes('concert'))).toBe(
        true
      );
    });

    it('should return empty array when no matches found', () => {
      const result = filterAndSortEvents(mockEvents, 'NonExistent', 'date');
      expect(result).toHaveLength(0);
    });

    it('should handle partial matches', () => {
      const result = filterAndSortEvents(mockEvents, 'Fest', 'date');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Festival B');
    });

    it('should trim search query', () => {
      const result = filterAndSortEvents(mockEvents, '  Concert  ', 'date');
      expect(result).toHaveLength(2);
      expect(result.every((e) => e.title?.includes('Concert'))).toBe(true);
    });

    it('should filter by both title and location', () => {
      // Search for "Concert" should find events with "Concert" in title
      // Search for "Venue A" should find events with "Venue A" in location
      const result1 = filterAndSortEvents(mockEvents, 'Concert', 'date');
      const result2 = filterAndSortEvents(mockEvents, 'Venue A', 'date');

      expect(result1).toHaveLength(2);
      expect(result2).toHaveLength(2);
    });
  });

  describe('Sorting by Date', () => {
    it('should sort events by date descending (newest first)', () => {
      const result = filterAndSortEvents(mockEvents, '', 'date');
      expect(result).toHaveLength(4);

      // Check dates are in descending order
      const dates = result.map((e) => new Date(e.startDate || 0).getTime());
      expect(dates[0]).toBeGreaterThanOrEqual(dates[1]);
      expect(dates[1]).toBeGreaterThanOrEqual(dates[2]);
      expect(dates[2]).toBeGreaterThanOrEqual(dates[3]);

      // Verify first event is the newest
      expect(result[0].startDate).toBe('2025-04-05T12:00:00Z');
      expect(result[result.length - 1].startDate).toBe('2025-01-15T10:00:00Z');
    });

    it('should handle events without dates', () => {
      const eventsWithMissingDates: Event[] = [
        {
          id: 1,
          sqid: 'event-1',
          name: 'Event 1',
          title: 'Event 1',
          startDate: '2025-01-15T10:00:00Z',
        },
        {
          id: 2,
          sqid: 'event-2',
          name: 'Event 2',
          title: 'Event 2',
          // No startDate
        },
        {
          id: 3,
          sqid: 'event-3',
          name: 'Event 3',
          title: 'Event 3',
          startDate: '2025-03-20T14:00:00Z',
        },
      ];

      const result = filterAndSortEvents(eventsWithMissingDates, '', 'date');
      expect(result).toHaveLength(3);
      // Events without dates should be sorted to the end
      expect(result[result.length - 1].startDate).toBeUndefined();
    });
  });

  describe('Sorting by Title', () => {
    it('should sort events alphabetically by title', () => {
      const result = filterAndSortEvents(mockEvents, '', 'title');
      expect(result).toHaveLength(4);

      // Check titles are in alphabetical order
      expect(result[0].title).toBe('Concert A');
      expect(result[1].title).toBe('Concert D');
      expect(result[2].title).toBe('Festival B');
      expect(result[3].title).toBe('Show C');
    });

    it('should handle events without titles', () => {
      const eventsWithMissingTitles: Event[] = [
        {
          id: 1,
          sqid: 'event-1',
          name: 'Event B',
          title: 'Event B',
        },
        {
          id: 2,
          sqid: 'event-2',
          name: 'Event A',
          // No title
        },
        {
          id: 3,
          sqid: 'event-3',
          name: 'Event C',
          title: 'Event C',
        },
      ];

      const result = filterAndSortEvents(eventsWithMissingTitles, '', 'title');
      expect(result).toHaveLength(3);
      // Events without titles should be handled (empty string comparison)
      // Check that titles are in alphabetical order using localeCompare
      const title0 = result[0].title || '';
      const title1 = result[1].title || '';
      expect(title0.localeCompare(title1)).toBeLessThanOrEqual(0);
    });
  });

  describe('Combined Filtering and Sorting', () => {
    it('should filter and then sort by date', () => {
      const result = filterAndSortEvents(mockEvents, 'Concert', 'date');
      expect(result).toHaveLength(2);
      // Should be sorted by date (newest first)
      expect(result[0].startDate).toBe('2025-04-05T12:00:00Z');
      expect(result[1].startDate).toBe('2025-01-15T10:00:00Z');
    });

    it('should filter and then sort by title', () => {
      const result = filterAndSortEvents(mockEvents, 'Concert', 'title');
      expect(result).toHaveLength(2);
      // Should be sorted alphabetically
      expect(result[0].title).toBe('Concert A');
      expect(result[1].title).toBe('Concert D');
    });

    it('should maintain sort order after filtering', () => {
      // Filter by location, then sort by date
      const result = filterAndSortEvents(mockEvents, 'Venue A', 'date');
      expect(result).toHaveLength(2);
      expect(result[0].startDate).toBe('2025-04-05T12:00:00Z');
      expect(result[1].startDate).toBe('2025-01-15T10:00:00Z');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty events array', () => {
      const result = filterAndSortEvents([], '', 'date');
      expect(result).toHaveLength(0);
    });

    it('should handle empty events array with search query', () => {
      const result = filterAndSortEvents([], 'test', 'date');
      expect(result).toHaveLength(0);
    });

    it('should handle events with special characters in title', () => {
      const eventsWithSpecialChars: Event[] = [
        {
          id: 1,
          sqid: 'event-1',
          name: 'Event & More',
          title: 'Event & More',
        },
        {
          id: 2,
          sqid: 'event-2',
          name: 'Event @ Home',
          title: 'Event @ Home',
        },
      ];

      const result = filterAndSortEvents(eventsWithSpecialChars, 'Event', 'title');
      expect(result).toHaveLength(2);
    });

    it('should handle very long search queries', () => {
      const longQuery = 'a'.repeat(1000);
      const result = filterAndSortEvents(mockEvents, longQuery, 'date');
      expect(result).toHaveLength(0);
    });
  });
});

