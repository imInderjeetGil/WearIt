import api from "./axios";

export const getSizes = () =>
  api.get("/sizes");