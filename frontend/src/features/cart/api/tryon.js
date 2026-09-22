// src/features/cart/api/tryon.js

import api from "../../../shared/api/http";

export const generateTryOn = () => api.post("/try-on/generate");

export const uploadTryOnReference = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const { data } = await api.post(
    "/try-on/upload-reference",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};