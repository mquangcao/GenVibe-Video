import axiosClient from './axiosClient';

export const connectPlatform = async () => {
  return await axiosClient.get('api/connections/connect-youtube');
};

export const getUrlConnection = async () => {
  return await axiosClient.get(`api/oauth/youtube-url?redirectUri=https://localhost:50464/account/platform-connections`);
};

export const getChannelName = async () => {
  return await axiosClient.get('api/social-platform/channel-name');
};
