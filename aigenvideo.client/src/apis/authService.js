import axiosClient from './axiosClient';

export const signIn = async (body) => {
  return await axiosClient.post('api/auth/login', body);
};

export const signUp = async (body) => {
  return await axiosClient.post('api/auth/register', body);
};

export const logout = async () => {
  return await axiosClient.post('api/auth/logout');
};

export const forgotPassword = async (body) => {
  return await axiosClient.post('api/auth/forgot-password', body);
};

export const resetPassword = async (body) => {
  return await axiosClient.post('api/auth/reset-password', body);
};
