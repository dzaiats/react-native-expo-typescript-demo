import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useEventsStore } from '@/store/eventsStore';
import { useThemeStore } from '@/store/themeStore';
import { EventCard } from '@/components/EventCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { Event } from '@/types/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const EventsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const theme = useThemeStore((state) => state.theme);
  const { events, loading, error, fetchEvents, refreshEvents } =
    useEventsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    refreshEvents();
  };

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetails', {
      eventSqid: event.sqid,
      eventTitle: event.title || '',
    });
  };

  const filteredAndSortedEvents = React.useMemo(() => {
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
        return a.title?.localeCompare(b.title);
      }
    });

    return filtered;
  }, [events, searchQuery, sortBy]);

  const renderEvent = ({ item }: { item: Event }) => (
    <EventCard
      event={item}
      onPress={() => handleEventPress(item)}
      testID={`event-card-${item.sqid}`}
    />
  );

  const renderLoadingSkeletons = () => (
    <View testID="events-loading-skeletons">
      {[1, 2, 3].map((i) => (
        <LoadingSkeleton
          key={i}
          height={280}
          testID={`loading-skeleton-${i}`}
        />
      ))}
    </View>
  );

  if (error) {
    return (
      <View
        testID="events-error"
        style={[
          styles.container,
          styles.centerContent,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text
          testID="events-error-text"
          style={[styles.errorText, { color: theme.colors.error }]}
        >
          {error}
        </Text>
        <TouchableOpacity
          testID="events-retry-button"
          style={[
            styles.retryButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={fetchEvents}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      testID="events-list-screen"
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        testID="events-search-container"
        style={[
          styles.searchContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <TextInput
          testID="events-search-input"
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.card,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          placeholder="Search events..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View
          testID="events-sort-container"
          style={styles.sortContainer}
        >
          <TouchableOpacity
            testID="events-sort-date"
            style={[
              styles.sortButton,
              {
                backgroundColor:
                  sortBy === 'date'
                    ? theme.colors.primary
                    : theme.colors.surface,
              },
            ]}
            onPress={() => setSortBy('date')}
          >
            <Text
              style={[
                styles.sortButtonText,
                {
                  color:
                    sortBy === 'date'
                      ? '#FFFFFF'
                      : theme.colors.text,
                },
              ]}
            >
              Date
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="events-sort-title"
            style={[
              styles.sortButton,
              {
                backgroundColor:
                  sortBy === 'title'
                    ? theme.colors.primary
                    : theme.colors.surface,
              },
            ]}
            onPress={() => setSortBy('title')}
          >
            <Text
              style={[
                styles.sortButtonText,
                {
                  color:
                    sortBy === 'title'
                      ? '#FFFFFF'
                      : theme.colors.text,
                },
              ]}
            >
              Title
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && events.length === 0 ? (
        renderLoadingSkeletons()
      ) : (
        <FlatList
          testID="events-list"
          data={filteredAndSortedEvents}
          renderItem={renderEvent}
          keyExtractor={(item) => item.sqid}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              testID="events-refresh-control"
              refreshing={loading && events.length > 0}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View
              testID="events-empty"
              style={[styles.centerContent, styles.emptyContainer]}
            >
              <Text
                testID="events-empty-text"
                style={[styles.emptyText, { color: theme.colors.textSecondary }]}
              >
                {loading ? 'Loading events...' : events.length === 0 && !error ? 'No events found' : 'No events match your search'}
              </Text>
              {!loading && events.length === 0 && !error && (
                <TouchableOpacity
                  testID="events-empty-retry"
                  style={[
                    styles.retryButton,
                    { backgroundColor: theme.colors.primary, marginTop: 16 },
                  ]}
                  onPress={fetchEvents}
                >
                  <Text style={styles.retryButtonText}>Refresh</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  sortContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
  },
});

