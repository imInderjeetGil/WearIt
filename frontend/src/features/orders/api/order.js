import api from "../../../shared/api/http";

export const placeOrder = (data) =>
  api.post("/orders", data);

export const getOrders = () =>
  api.get("/orders/my-orders");

export const cancelOrder = (orderId) =>
  api.post(`/orders/${orderId}/cancel`);

export const requestCancellation = (orderId) =>
  api.post(`/orders/${orderId}/cancel-request`);
