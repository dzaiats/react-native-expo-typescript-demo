import { renderHook, act } from '@testing-library/react-native';
import { useBasketStore } from '@/store/basketStore';
import { TicketTypeInfo } from '@/types/api';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('BasketStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useBasketStore());
    act(() => {
      result.current.clearBasket();
    });
  });

  const mockTicketInfo: TicketTypeInfo = {
    id: 'ticket-1',
    sqid: 'ticket-1',
    name: 'Test Ticket',
    title: 'Test Ticket',
    price: 10,
    currency: 'EUR',
  };

  const mockTicketInfo2: TicketTypeInfo = {
    id: 'ticket-2',
    sqid: 'ticket-2',
    name: 'Test Ticket 2',
    title: 'Test Ticket 2',
    price: 20,
    currency: 'EUR',
  };

  describe('addItem', () => {
    it('should add a new item to the basket', () => {
      const { result } = renderHook(() => useBasketStore());

      act(() => {
        result.current.addItem(
          'ticket-1',
          mockTicketInfo,
          'event-1',
          'Test Event'
        );
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].ticketTypeSqid).toBe('ticket-1');
      expect(result.current.items[0].quantity).toBe(1);
      expect(result.current.getItemCount()).toBe(1);
    });

    it('should increment quantity when adding an existing item', () => {
      const { result } = renderHook(() => useBasketStore());

      act(() => {
        result.current.addItem(
          'ticket-1',
          mockTicketInfo,
          'event-1',
          'Test Event'
        );
      });

      act(() => {
        result.current.addItem(
          'ticket-1',
          mockTicketInfo,
          'event-1',
          'Test Event'
        );
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
      expect(result.current.getItemCount()).toBe(2);
    });
  });

  describe('updateQuantity - Increment', () => {
    it('should increment item quantity', () => {
      const { result } = renderHook(() => useBasketStore());

      // Add item first
      act(() => {
        result.current.addItem(
          'ticket-1',
          mockTicketInfo,
          'event-1',
          'Test Event'
        );
      });

      // Increment quantity
      act(() => {
        result.current.updateQuantity('ticket-1', 2);
      });

      expect(result.current.items[0].quantity).toBe(2);
      expect(result.current.getItemCount()).toBe(2);
    });

    it('should increment quantity multiple times', () => {
      const { result } = renderHook(() => useBasketStore());

      act(() => {
        result.current.addItem(
          'ticket-1',
          mockTicketInfo,
          'event-1',
          'Test Event'
        );
      });

      act(() => {
        result.current.updateQuantity('ticket-1', 3);
      });

      act(() => {
        result.current.updateQuantity('ticket-1', 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.getItemCount()).toBe(5);
    });
  });

  describe('updateQuantity - Decrement', () => {
    it('should decrement item quantity', () => {
      const { result } = renderHook(() => useBasketStore());

      // Add item with quantity 3
      act(() => {
        result.current.addItem(
          'ticket-1',
          mockTicketInfo,
          'event-1',
          'Test Event'
        );
      });

      act(() => {
        result.current.updateQuantity('ticket-1', 3);
      });

      // Decrement to 2
      act(() => {
        result.current.updateQuantity('ticket-1', 2);
      });

      expect(result.current.items[0].quantity).toBe(2);
      expect(result.current.getItemCount()).toBe(2);
    });

    it('should remove item when quantity is decremented to 0', () => {
      const { result } = renderHook(() => useBasketStore());

      act(() => {
        result.current.addItem(
          'ticket-1',
          mockTicketInfo,
          'event-1',
          'Test Event'
        );
      });

      // Decrement to 0 (should remove)
      act(() => {
        result.current.updateQuantity('ticket-1', 0);
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.getItemCount()).toBe(0);
    });

    it('should remove item when quantity is set to negative', () => {
      const { result } = renderHook(() => useBasketStore());

      act(() => {
        result.current.addItem(
          'ticket-1',
          mockTicketInfo,
          'event-1',
          'Test Event'
        );
      });

      // Set to negative (should remove)
      act(() => {
        result.current.updateQuantity('ticket-1', -1);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('removeItem', () => {
    it('should remove an item from the basket', () => {
      const { result } = renderHook(() => useBasketStore());

      act(() => {
        result.current.addItem(
          'ticket-1',
          mockTicketInfo,
          'event-1',
          'Test Event'
        );
        result.current.addItem(
          'ticket-2',
          mockTicketInfo2,
          'event-1',
          'Test Event'
        );
      });

      expect(result.current.items).toHaveLength(2);

      act(() => {
        result.current.removeItem('ticket-1');
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].ticketTypeSqid).toBe('ticket-2');
      expect(result.current.getItemCount()).toBe(1);
    });
  });

  describe('getTotal', () => {
    it('should calculate total correctly for single item', () => {
      const { result } = renderHook(() => useBasketStore());

      act(() => {
        result.current.addItem(
          'ticket-1',
          mockTicketInfo,
          'event-1',
          'Test Event'
        );
      });

      expect(result.current.getTotal()).toBe(10);
    });

    it('should calculate total correctly for multiple items', () => {
      const { result } = renderHook(() => useBasketStore());

      act(() => {
        result.current.addItem(
          'ticket-1',
          mockTicketInfo,
          'event-1',
          'Test Event'
        );
        result.current.addItem(
          'ticket-2',
          mockTicketInfo2,
          'event-1',
          'Test Event'
        );
      });

      expect(result.current.getTotal()).toBe(30); // 10 + 20
    });

    it('should calculate total correctly with quantity', () => {
      const { result } = renderHook(() => useBasketStore());

      act(() => {
        result.current.addItem(
          'ticket-1',
          mockTicketInfo,
          'event-1',
          'Test Event'
        );
        result.current.updateQuantity('ticket-1', 3);
      });

      expect(result.current.getTotal()).toBe(30); // 10 * 3
    });

    it('should handle items with no price', () => {
      const { result } = renderHook(() => useBasketStore());

      const freeTicket: TicketTypeInfo = {
        id: 'ticket-free',
        sqid: 'ticket-free',
        name: 'Free Ticket',
        title: 'Free Ticket',
      };

      act(() => {
        result.current.addItem(
          'ticket-free',
          freeTicket,
          'event-1',
          'Test Event'
        );
      });

      expect(result.current.getTotal()).toBe(0);
    });
  });

  describe('getItemCount', () => {
    it('should return correct item count', () => {
      const { result } = renderHook(() => useBasketStore());

      act(() => {
        result.current.addItem(
          'ticket-1',
          mockTicketInfo,
          'event-1',
          'Test Event'
        );
        result.current.addItem(
          'ticket-2',
          mockTicketInfo2,
          'event-1',
          'Test Event'
        );
        result.current.updateQuantity('ticket-1', 3);
      });

      expect(result.current.getItemCount()).toBe(4); // 3 + 1
    });
  });

  describe('clearBasket', () => {
    it('should clear all items from basket', () => {
      const { result } = renderHook(() => useBasketStore());

      act(() => {
        result.current.addItem(
          'ticket-1',
          mockTicketInfo,
          'event-1',
          'Test Event'
        );
        result.current.addItem(
          'ticket-2',
          mockTicketInfo2,
          'event-1',
          'Test Event'
        );
      });

      expect(result.current.items).toHaveLength(2);

      act(() => {
        result.current.clearBasket();
      });

      expect(result.current.items).toHaveLength(0);
      expect(result.current.getItemCount()).toBe(0);
      expect(result.current.getTotal()).toBe(0);
    });
  });
});

