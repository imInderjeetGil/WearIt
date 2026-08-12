import api from "../../../shared/api/http";

// Occasion options mirror the backend's OCCASION_GROUPS keys.
export const OCCASIONS = [
  "Casual",
  "Party",
  "Date",
  "Office",
  "College",
  "Diwali",
  "Holi",
  "Wedding",
  "Festival",
  "Traditional",
  "Formal",
  "Travel",
  "Streetwear",
  "Sports",
  "Ethnic",
];

export const getRecommendations = (occasion, budget) =>
  api.post("/recommendations", { occasion, budget });
