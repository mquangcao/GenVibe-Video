import axiosClient from './axiosClient';

/**
 * Gửi yêu cầu đến backend để tạo nội dung dựa trên chủ đề và nguồn.
 * @param {object} body - Dữ liệu yêu cầu.
 * @param {string} body.topic - Chủ đề người dùng nhập vào.
 * @param {string} body.context - Nguồn dữ liệu được chọn (e.g., 'Wikipedia').
 * @returns {Promise<object>} Promise trả về phản hồi từ API.
 */
export const generateContent = async (body) => {
  return await axiosClient.post('api/content/generate', body);
};
