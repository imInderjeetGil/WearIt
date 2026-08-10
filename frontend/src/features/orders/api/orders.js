import api from "../../../shared/api/http";

export const getAllOrders = (params = {}) =>
  api.get("/orders/all", { params });

export const getOrderItems = (orderId) =>
  api.get(`/orders/${orderId}/items`);

export const updateOrderStatus = (orderId, status) =>
  api.patch(`/orders/${orderId}/status`, status);

export const cancelOrder = (orderId) =>
  api.post(`/orders/${orderId}/cancel`);

export const rejectCancellation = (orderId) =>
  api.post(`/orders/${orderId}/cancel-request/reject`);