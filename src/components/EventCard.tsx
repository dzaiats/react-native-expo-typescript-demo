import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Event } from '@/types/api';
import { apiClient } from '@/services/api';
import { useThemeStore } from '@/store/themeStore';

interface EventCardProps {
  event: Event;
  onPress: () => void;
  testID?: string;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  testID,
}) => {
  const theme = useThemeStore((state) => state.theme);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const imageUrl = event.coverImageGuid
    ? apiClient.getImageUrl(event.coverImageGuid)
    : null;

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.shadow,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {imageUrl && (
        <Image
          testID={`${testID}-image`}
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content} testID={`${testID}-content`}>
        <Text
          testID={`${testID}-title`}
          style={[styles.title, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {event.title}
        </Text>
        {(event.startDate || event.location) && (
          <View style={styles.meta} testID={`${testID}-meta`}>
            {event.startDate && (
              <Text
                testID={`${testID}-date`}
                style={[styles.metaText, { color: theme.colors.textSecondary }]}
              >
                {formatDate(event.startDate)}
              </Text>
            )}
            {event.location && (
              <Text
                testID={`${testID}-location`}
                style={[styles.metaText, { color: theme.colors.textSecondary }]}
              >
                {event.location}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 14,
  },
});

