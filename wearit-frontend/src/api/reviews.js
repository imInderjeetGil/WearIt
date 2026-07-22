import api from './client'

export const getProductReviews = (productId) =>
  api.get(`/reviews/${productId}`)

export const getAverageRating = (productId) =>
  api.get(`/reviews/${productId}/average`)

export const addReview = (productId, data) =>
  api.post(`/reviews/${productId}`, data)
