import { create } from 'zustand'
import { getCart, addToCart, removeFromCart } from '../api/cart'

const useCartStore = create((set, get) => ({
  items: [],
  loading: false,
  isOpen: false,

  fetchCart: async () => {
    set({ loading: true })
    try {
      const { data } = await getCart()
      set({ items: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  addItem: async (productId, quantity = 1) => {
    await addToCart(productId, quantity)
    get().fetchCart()
  },

  removeItem: async (cartItemId) => {
    await removeFromCart(cartItemId)
    set({ items: get().items.filter((item) => item.id !== cartItemId) })
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

  get totalItems() {
    return get().items.reduce((sum, item) => sum + item.quantity, 0)
  },

  get subtotal() {
    return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  },
}))

export default useCartStore
