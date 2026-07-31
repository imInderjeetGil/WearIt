// src/store/cartStore.js

import { create } from "zustand";
import {
  getCart,
  addToCart,
  removeFromCart,
} from "../api/cart";
import { getSubtotal } from "../../../shared/utils/pricing";
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
      throw err;
    }
  },

  addItem: async (productId, sizeId, quantity = 1) => {
    try {
      await addToCart(productId, sizeId, quantity);

      await get().fetchCart();
    } catch (err) {
      console.error(err);
      throw err;
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
      throw err;
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
        getSubtotal(item.product, item.quantity),
      0
    ),
}));

export default useCartStore;
