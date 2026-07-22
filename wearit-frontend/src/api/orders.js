import api from './client'

export const placeOrder = () =>
  api.post('/orders/')

export const getMyOrders = () =>
  api.get('/orders/my-orders')

export const getAllOrders = () =>
  api.get('/orders/all')
