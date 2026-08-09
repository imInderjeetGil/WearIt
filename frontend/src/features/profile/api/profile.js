// profile.js

import api from "../../../shared/api/http";

export const getProfile = () => api.get("/profile");

export const updateProfile = (data) =>
  api.put("/profile", data);

export const uploadProfileImage = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const { data } = await api.post(
    "/profile/upload-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};