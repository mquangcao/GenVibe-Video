import axiosClient from "./axiosClient";

export const getAccountInfo = async (id) => {
    return await axiosClient.get(`api/account/${id}`);
}
