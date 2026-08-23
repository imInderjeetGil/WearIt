import api from "../../../shared/api/http";

// Options mirror backend/schemas/product_metadata.py OCCASIONS.
export const OCCASIONS = [
  "Casual",
  "Formal",
  "Party",
  "Wedding",
  "Festive",
  "Sports",
  "Office",
  "Ethnic",
];

// AI fashion inference + deterministic outfit recommendation. The backend
// interprets the description with Gemini, then retrieves/scores real
// products — the LLM never picks products.
export const findYourLook = (payload) =>
  api.post("/looks/find-your-look", payload);