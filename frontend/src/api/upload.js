import api from "./axios";

export const uploadProductImage = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const { data } = await api.post(
    "/products/upload-image",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};