import api from "../../../shared/api/http";

export const getSizes = () =>
  api.get("/sizes");

export const createSize = (data) =>
  api.post("/sizes/", data);

export const updateSize = (id, data) =>
  api.put(`/sizes/${id}`, data);

export const deleteSize = (id) =>
  api.delete(`/sizes/${id}`);