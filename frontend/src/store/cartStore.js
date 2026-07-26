// src/store/cartStore.js

import { create } from "zustand";
import {
  getCart,
  addToCart,
  removeFromCart,
} from "../api/cart";

const useCartStore = create((set, get) => ({
  items: [],
  loading: false,

  fetchCart: async () => {
    try {
      set({ loading: true });

      const { data } = await getCart();

      set({
        items: data,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    try {
      await addToCart(productId, quantity);

      await get().fetchCart();
    } catch (err) {
      console.error(err);
    }
  },

  removeItem: async (cartItemId) => {
    try {
      await removeFromCart(cartItemId);

      set({
        items: get().items.filter(
          (item) => item.id !== cartItemId
        ),
      });
    } catch (err) {
      console.error(err);
    }
  },

  clearCart: () => {
    set({
      items: [],
    });
  },

  totalItems: () =>
    get().items.reduce(
      (sum, item) => sum + item.quantity,
      0
    ),

  subtotal: () =>
    get().items.reduce(
      (sum, item) =>
        sum +
        item.product.price * item.quantity,
      0
    ),
}));

export default useCartStore;