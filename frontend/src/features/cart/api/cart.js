// src/api/cart.js

import api from "../../../shared/api/http";

export const getCart = () => api.get("/cart");

export const addToCart = (
  productId,
  sizeId,
  quantity = 1
) =>
  api.post("/cart", {
    product_id: productId,
    size_id: sizeId,
    quantity,
  });

export const removeFromCart = (cartItemId) =>
  api.delete(`/cart/${cartItemId}`);

export const updateCartItem = (cartItemId, quantity) =>
  api.patch(`/cart/${cartItemId}`, { quantity });
