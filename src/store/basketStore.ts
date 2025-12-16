import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BasketItem, TicketTypeInfo } from '@/types/api';

interface BasketState {
  items: BasketItem[];
  addItem: (
    ticketTypeSqid: string,
    ticketTypeInfo: TicketTypeInfo,
    eventSqid: string,
    eventTitle: string
  ) => void;
  removeItem: (ticketTypeSqid: string) => void;
  updateQuantity: (ticketTypeSqid: string, quantity: number) => void;
  clearBasket: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useBasketStore = create<BasketState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (ticketTypeSqid, ticketTypeInfo, eventSqid, eventTitle) => {
        const items = get().items;
        const existingItem = items.find(
          (item) => item.ticketTypeSqid === ticketTypeSqid
        );

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.ticketTypeSqid === ticketTypeSqid
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                ticketTypeSqid,
                ticketTypeInfo,
                quantity: 1,
                eventSqid,
                eventTitle,
              },
            ],
          });
        }
      },
      removeItem: (ticketTypeSqid) => {
        set({
          items: get().items.filter(
            (item) => item.ticketTypeSqid !== ticketTypeSqid
          ),
        });
      },
      updateQuantity: (ticketTypeSqid, quantity) => {
        if (quantity <= 0) {
          get().removeItem(ticketTypeSqid);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.ticketTypeSqid === ticketTypeSqid
              ? { ...item, quantity }
              : item
          ),
        });
      },
      clearBasket: () => {
        set({ items: [] });
      },
      getTotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.ticketTypeInfo.price || 0;
          return total + price * item.quantity;
        }, 0);
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'basket-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

