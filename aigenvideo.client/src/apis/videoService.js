import axiosClient from './axiosClient';

export const getMyVideos = async () => {
  return await axiosClient.get(`api/video/my-videos`);
};
