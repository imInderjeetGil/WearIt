// src/api/cart.js

import api from "./axios";

export const getCart = () => api.get("/cart");

export const addToCart = (productId, quantity = 1) =>
  api.post("/cart", {
    product_id: productId,
    quantity,
  });

export const removeFromCart = (cartItemId) =>
  api.delete(`/cart/${cartItemId}`);