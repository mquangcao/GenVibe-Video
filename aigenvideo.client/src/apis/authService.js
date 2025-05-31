import axiosClient from './axiosClient';

export const signIn = async (body) => {
  return await axiosClient.post('api/auth/login', body);
};

export const register = async (body) => {
  return await axiosClient.post('api/auth/register', body);
};

export const logout = async () => {
  return await axiosClient.post('api/auth/logout');
};
