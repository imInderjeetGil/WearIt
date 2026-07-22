import api from './client'

export const getCart = () =>
  api.get('/cart/')

export const addToCart = (product_id, quantity = 1) =>
  api.post('/cart/', { product_id, quantity })

export const removeFromCart = (cart_item_id) =>
  api.delete(`/cart/${cart_item_id}`)
