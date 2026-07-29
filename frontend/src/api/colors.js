import api from "./axios";

export const getColors = () =>
  api.get("/colors");