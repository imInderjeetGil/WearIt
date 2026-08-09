import api from "../../../shared/api/http";

export const getProductReviews = (productId) =>
  api.get(`/reviews/product/${productId}`);

export const createReview = (data) =>
  api.post("/reviews", data);

export const deleteReview = (reviewId) =>
  api.delete(`/reviews/${reviewId}`);