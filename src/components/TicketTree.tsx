import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { EventShop, TicketTypeInfo, TicketGroup } from '@/types/api';
import { useThemeStore } from '@/store/themeStore';
import { useBasketStore } from '@/store/basketStore';
import Toast from 'react-native-toast-message';

interface TicketTreeProps {
  eventShop: EventShop;
  eventSqid: string;
  eventTitle: string;
  testID?: string;
}

export const TicketTree: React.FC<TicketTreeProps> = ({
  eventShop,
  eventSqid,
  eventTitle,
  testID,
}) => {
  const theme = useThemeStore((state) => state.theme);
  const addItem = useBasketStore((state) => state.addItem);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  // Initialize expanded groups based on collapsed property
  React.useEffect(() => {
    const initiallyExpanded = new Set<number>();
    eventShop.children?.forEach((group) => {
      if (!group.collapsed) {
        initiallyExpanded.add(group.id);
      }
    });
    setExpandedGroups(initiallyExpanded);
  }, [eventShop]);

  const toggleGroup = (groupId: number) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleAddToBasket = (ticketTypeId: string, info: TicketTypeInfo) => {
    addItem(ticketTypeId, info, eventSqid, eventTitle);
    Toast.show({
      type: 'success',
      text1: 'Added to basket',
      text2: info.name || info.title || 'Ticket',
      position: 'bottom',
    });
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (price === undefined || price === null) return 'Free';
    const currencySymbol = currency === 'EUR' ? '€' : currency || '€';
    return `${currencySymbol}${price.toFixed(2)}`;
  };

  const renderGroup = (group: TicketGroup, level: number = 0) => {
    const isExpanded = expandedGroups.has(group.id);
    const paddingLeft = 16 + level * 16;

    // Get ticket info for each ticket type ID in the group
    const tickets = group.ticketTypes
      .map((ticketTypeId) => {
        const info = eventShop.ticketTypeDictionary?.[ticketTypeId];
        if (!info) return null;
        
        // Map API response to our interface
        const mappedInfo: TicketTypeInfo = {
          ...info,
          sqid: info.id,
          title: info.name,
        };
        
        return { ticketTypeId, info: mappedInfo };
      })
      .filter((ticket): ticket is { ticketTypeId: string; info: TicketTypeInfo } => ticket !== null);

    return (
      <View key={group.id} testID={`${testID}-group-${group.id}`}>
        <TouchableOpacity
          testID={`${testID}-group-header-${group.id}`}
          style={[
            styles.groupHeader,
            {
              backgroundColor: theme.colors.card,
              borderBottomColor: theme.colors.border,
              paddingLeft,
            },
          ]}
          onPress={() => toggleGroup(group.id)}
        >
          <Text
            style={[styles.groupTitle, { color: theme.colors.text }]}
            testID={`${testID}-group-title-${group.id}`}
          >
            {group.name}
          </Text>
          <Text
            style={[
              styles.expandIcon,
              { color: theme.colors.textSecondary },
            ]}
            testID={`${testID}-group-icon-${group.id}`}
          >
            {isExpanded ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <>
            {tickets.map(({ ticketTypeId, info }) => (
              <View
                key={ticketTypeId}
                testID={`${testID}-ticket-${ticketTypeId}`}
                style={[
                  styles.ticketItem,
                  {
                    backgroundColor: theme.colors.card,
                    borderBottomColor: theme.colors.border,
                    paddingLeft: paddingLeft + 16,
                  },
                ]}
              >
                <View style={styles.ticketInfo}>
                  <Text
                    testID={`${testID}-ticket-title-${ticketTypeId}`}
                    style={[styles.ticketTitle, { color: theme.colors.text }]}
                  >
                    {info.name || info.title}
                  </Text>
                  {info.description && (
                    <Text
                      testID={`${testID}-ticket-description-${ticketTypeId}`}
                      style={[
                        styles.ticketDescription,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {info.description}
                    </Text>
                  )}
                  <Text
                    testID={`${testID}-ticket-price-${ticketTypeId}`}
                    style={[
                      styles.ticketPrice,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {formatPrice(info.price, info.currency || eventShop.currency)}
                  </Text>
                </View>
                <TouchableOpacity
                  testID={`${testID}-ticket-add-button-${ticketTypeId}`}
                  style={[
                    styles.addButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => handleAddToBasket(ticketTypeId, info)}
                >
                  <Text
                    style={styles.addButtonText}
                    testID={`${testID}-ticket-add-button-text-${ticketTypeId}`}
                  >
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
            {group.children && group.children.length > 0 && (
              <View testID={`${testID}-group-children-${group.id}`}>
                {group.children.map((childGroup) => renderGroup(childGroup, level + 1))}
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  if (!eventShop.children || eventShop.children.length === 0) {
    return (
      <View
        testID={`${testID}-empty`}
        style={[
          styles.emptyContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text
          testID={`${testID}-empty-text`}
          style={[styles.emptyText, { color: theme.colors.textSecondary }]}
        >
          No tickets available
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      testID={testID}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {eventShop.children.map((group) => renderGroup(group, 0))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  expandIcon: {
    fontSize: 12,
  },
  ticketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 48,
    borderBottomWidth: 1,
  },
  ticketInfo: {
    flex: 1,
    marginRight: 12,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  ticketDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

