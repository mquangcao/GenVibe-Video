import axiosClient from './axiosClient';

export const getUrlConnection = async (platform) => {
  return await axiosClient.get(
    `api/oauth/platform-connect?platform=${platform}&redirectUri=https://localhost:50464/account/platform-connections`
  );
};

export const getPlatformInfo = async (platform) => {
  return await axiosClient.get(`api/social-platform/${platform}/info`);
};

export const getAllPlatformConnections = async () => {
  return await axiosClient.get('api/social-platform/connections');
};
