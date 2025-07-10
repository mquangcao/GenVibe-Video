import axiosClient from './axiosClient';

export const getMyVideos = async () => {
  return await axiosClient.get(`api/video/my-videos`);
};

export const getVideoById = async (videoid) => {
  return await axiosClient.get(`api/video/my-videos/${videoid}`);
};

export const updateVideoById = async (body) => {
  return await axiosClient.put(`api/video/my-videos/${body.id}`, { videoUrl: body.videoUrl });
};

export const getVideoUploadedPlatforms = async (videoId) => {
  return await axiosClient.get(`api/video/my-videos/${videoId}/upload`);
};

export const uploadVideoToPlatform = async (body) => {
  return await axiosClient.post(`api/video/upload`, body);
};
