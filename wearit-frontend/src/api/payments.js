import api from './client'

export const createRazorpayOrder = () =>
  api.post('/payments/create-order')

export const verifyPayment = (data) =>
  api.post('/payments/verify', data)
