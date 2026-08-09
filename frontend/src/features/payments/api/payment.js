import api from "../../../shared/api/http";

export const createPaymentOrder = (shipping) =>
  api.post("/payments/create-order", shipping);

export const verifyPayment = (payload) =>
  api.post("/payments/verify", payload);
