import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem } from '../types'

interface CartState {
  items: CartItem[]
  restaurantId: string | null
  addItem: (item: CartItem, restaurantId: string) => void
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      addItem: (item, restaurantId) => {
        const current = get()
        if (current.restaurantId && current.restaurantId !== restaurantId) {
          // Clear cart if switching restaurants
          set({ items: [item], restaurantId })
        } else {
          const existing = current.items.find((i) => i.menuItemId === item.menuItemId)
          if (existing) {
            set({
              items: current.items.map((i) =>
                i.menuItemId === item.menuItemId
                  ? { ...i, quantity: i.quantity + item.quantity, totalPrice: i.totalPrice + item.totalPrice }
                  : i
              ),
              restaurantId,
            })
          } else {
            set({ items: [...current.items, item], restaurantId })
          }
        }
      },
      removeItem: (menuItemId) =>
        set((state) => ({ items: state.items.filter((i) => i.menuItemId !== menuItemId) })),
      updateQuantity: (menuItemId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.menuItemId !== menuItemId)
              : state.items.map((i) =>
                  i.menuItemId === menuItemId
                    ? { ...i, quantity, totalPrice: i.unitPrice * quantity }
                    : i
                ),
        })),
      clearCart: () => set({ items: [], restaurantId: null }),
      getTotal: () => get().items.reduce((sum, item) => sum + item.totalPrice, 0),
    }),
    { name: 'cart-storage' }
  )
)
