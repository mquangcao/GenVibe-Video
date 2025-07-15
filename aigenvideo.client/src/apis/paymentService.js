import axiosClient from './axiosClient';

export const checkout = async (duration) => {
  return await axiosClient.get(`api/payment/checkout/${duration}`);
};

export const payment = async (data) => {
  return await axiosClient.post(`api/payment`, data);
};

export const getPlans = async () => {
  return await axiosClient.get(`api/payment/plans`);
};

export const getSummary = async () => {
  return await axiosClient.get(`api/admin/payments/summary`);
};
