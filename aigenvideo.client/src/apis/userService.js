import axiosClient from './axiosClient';

export const getAllUsers = async () => {
  return await axiosClient.get('api/users');
};

export const createUser = async (userData) => {
  return await axiosClient.post('api/admin/users', userData);
};

export const getUserById = async (id) => {
  return await axiosClient.get(`api/admin/users/${id}`);
};

export const updateUser = async (id, userData) => {
  return await axiosClient.put(`api/admin/users/${id}`, userData);
};
