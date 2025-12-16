import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBasketStore } from '../store/basketStore';
import { useThemeStore } from '../store/themeStore';
import { BasketItem } from '../types/api';

export const BasketScreen: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const insets = useSafeAreaInsets();
  const {
    items,
    updateQuantity,
    removeItem,
    getTotal,
    getItemCount,
    clearBasket,
  } = useBasketStore();

  const formatPrice = (price?: number, currency?: string) => {
    if (price === undefined || price === null) return 'Free';
    const currencySymbol = currency === 'EUR' ? '€' : currency || '€';
    return `${currencySymbol}${price.toFixed(2)}`;
  };

  const handleIncreaseQuantity = (ticketTypeSqid: string, currentQuantity: number) => {
    updateQuantity(ticketTypeSqid, currentQuantity + 1);
  };

  const handleDecreaseQuantity = (ticketTypeSqid: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(ticketTypeSqid, currentQuantity - 1);
    } else {
      removeItem(ticketTypeSqid);
    }
  };

  const renderBasketItem = ({ item }: { item: BasketItem }) => {
    const ticketName = item.ticketTypeInfo.name || item.ticketTypeInfo.title || 'Ticket';
    const price = item.ticketTypeInfo.price || 0;
    const currency = item.ticketTypeInfo.currency || 'EUR';
    const itemTotal = price * item.quantity;

    return (
      <View
        testID={`basket-item-${item.ticketTypeSqid}`}
        style={[
          styles.basketItem,
          {
            backgroundColor: theme.colors.card,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.itemInfo} testID={`basket-item-info-${item.ticketTypeSqid}`}>
          <Text
            testID={`basket-item-title-${item.ticketTypeSqid}`}
            style={[styles.itemTitle, { color: theme.colors.text }]}
          >
            {ticketName}
          </Text>
          <Text
            testID={`basket-item-event-${item.ticketTypeSqid}`}
            style={[styles.itemEvent, { color: theme.colors.textSecondary }]}
          >
            {item.eventTitle}
          </Text>
          <Text
            testID={`basket-item-price-${item.ticketTypeSqid}`}
            style={[styles.itemPrice, { color: theme.colors.textSecondary }]}
          >
            {formatPrice(price, currency)} each
          </Text>
        </View>

        <View
          testID={`basket-item-controls-${item.ticketTypeSqid}`}
          style={styles.itemControls}
        >
          <View
            testID={`basket-item-quantity-controls-${item.ticketTypeSqid}`}
            style={styles.quantityControls}
          >
            <TouchableOpacity
              testID={`basket-item-decrease-${item.ticketTypeSqid}`}
              style={[
                styles.quantityButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => handleDecreaseQuantity(item.ticketTypeSqid, item.quantity)}
            >
              <Text
                testID={`basket-item-decrease-text-${item.ticketTypeSqid}`}
                style={[styles.quantityButtonText, { color: theme.colors.text }]}
              >
                −
              </Text>
            </TouchableOpacity>

            <Text
              testID={`basket-item-quantity-${item.ticketTypeSqid}`}
              style={[styles.quantityText, { color: theme.colors.text }]}
            >
              {item.quantity}
            </Text>

            <TouchableOpacity
              testID={`basket-item-increase-${item.ticketTypeSqid}`}
              style={[
                styles.quantityButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => handleIncreaseQuantity(item.ticketTypeSqid, item.quantity)}
            >
              <Text
                testID={`basket-item-increase-text-${item.ticketTypeSqid}`}
                style={[styles.quantityButtonText, { color: theme.colors.text }]}
              >
                +
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            testID={`basket-item-total-${item.ticketTypeSqid}`}
            style={[styles.itemTotal, { color: theme.colors.primary }]}
          >
            {formatPrice(itemTotal, currency)}
          </Text>

          <TouchableOpacity
            testID={`basket-item-remove-${item.ticketTypeSqid}`}
            style={[
              styles.removeButton,
              { backgroundColor: theme.colors.error },
            ]}
            onPress={() => removeItem(item.ticketTypeSqid)}
          >
            <Text
              testID={`basket-item-remove-text-${item.ticketTypeSqid}`}
              style={styles.removeButtonText}
            >
              Remove
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (items.length === 0) {
    return (
      <View
        testID="basket-screen-empty"
        style={[
          styles.container,
          styles.emptyContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text
          testID="basket-empty-text"
          style={[styles.emptyText, { color: theme.colors.textSecondary }]}
        >
          Your basket is empty
        </Text>
        <Text
          testID="basket-empty-hint"
          style={[styles.emptyHint, { color: theme.colors.textSecondary }]}
        >
          Add tickets from event details to get started
        </Text>
      </View>
    );
  }

  const total = getTotal();
  const itemCount = getItemCount();

  return (
    <View
      testID="basket-screen"
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View
        testID="basket-header"
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.card,
            borderBottomColor: theme.colors.border,
            paddingTop: insets.top,
          },
        ]}
      >
        <Text
          testID="basket-header-title"
          style={[styles.headerTitle, { color: theme.colors.text }]}
        >
          Basket
        </Text>
        <Text
          testID="basket-header-count"
          style={[styles.headerCount, { color: theme.colors.textSecondary }]}
        >
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Text>
      </View>

      <FlatList
        testID="basket-list"
        data={items}
        renderItem={renderBasketItem}
        keyExtractor={(item) => item.ticketTypeSqid}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          <View
            testID="basket-footer"
            style={[
              styles.footer,
              {
                backgroundColor: theme.colors.card,
                borderTopColor: theme.colors.border,
              },
            ]}
          >
            <View
              testID="basket-total-container"
              style={styles.totalContainer}
            >
              <Text
                testID="basket-total-label"
                style={[styles.totalLabel, { color: theme.colors.text }]}
              >
                Total:
              </Text>
              <Text
                testID="basket-total-amount"
                style={[styles.totalAmount, { color: theme.colors.primary }]}
              >
                {formatPrice(total, 'EUR')}
              </Text>
            </View>

            <TouchableOpacity
              testID="basket-clear-button"
              style={[
                styles.clearButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={clearBasket}
            >
              <Text
                testID="basket-clear-button-text"
                style={[styles.clearButtonText, { color: theme.colors.error }]}
              >
                Clear Basket
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerCount: {
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 16,
  },
  basketItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  itemInfo: {
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemEvent: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
    marginRight: 12,
  },
  removeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    marginTop: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  clearButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

