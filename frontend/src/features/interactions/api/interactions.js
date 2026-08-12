import api from "../../../shared/api/http";

// Fire-and-forget: used to log "view" events. Wishlist / cart / purchase are
// recorded server-side inside their own flows, so the frontend only calls this
// for views. Never throws on failure (analytics must not break the page).
export async function recordInteraction(productId, type) {
  try {
    await api.post("/interactions", {
      product_id: productId,
      interaction_type: type,
    });
  } catch {
    /* silent — non-critical */
  }
}
