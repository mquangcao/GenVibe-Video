import axiosClient from "./axiosClient";

export const saveFullVideoData = async (body) => {
  return await axiosClient.post('api/saveVideo/save-video-data', body);
};

export default { saveFullVideoData }; 