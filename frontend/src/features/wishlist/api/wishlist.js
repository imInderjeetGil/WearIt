import api from "../../../shared/api/http";

export const toggleWishlist = (productId) =>
  api.post(`/wishlist/toggle/${productId}`);

export const getWishlist = () =>
  api.get("/wishlist");

export const getWishlistIds = () =>
  api.get("/wishlist/ids");