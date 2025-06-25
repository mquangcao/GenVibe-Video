import axiosClient from './axiosClient';

export const connectPlatform = async () => {
  return await axiosClient.get('api/connections/connect-youtube');
};
