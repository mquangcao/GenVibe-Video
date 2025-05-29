import axiosClient from "./axiosClient";

export const getAllUsers = async () => {
    return await axiosClient.get('api/users');
}