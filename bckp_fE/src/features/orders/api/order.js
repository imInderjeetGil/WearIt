import api from "../../../shared/api/http";

export const placeOrder = (data) =>
  api.post("/orders", data);

export const getOrders = () =>
  api.get("/orders/my-orders");
