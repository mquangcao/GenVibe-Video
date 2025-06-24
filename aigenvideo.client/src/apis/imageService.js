import axiosClient from "./axiosClient";

export const generateImage = async (body) => {
  return await axiosClient.post('api/imagegeneration/generate', body);
};

export default { generateImage }; 