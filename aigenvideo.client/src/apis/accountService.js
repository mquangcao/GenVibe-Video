import axiosClient from './axiosClient';

export const getAccountProfile = async () => {
  return await axiosClient.get(`api/account/profile`);
};
