import axiosClient from './axiosClient';

/**
 * Gửi yêu cầu đến backend để tạo âm thanh dựa trên văn bản.
 * @param {string} text - Văn bản người dùng nhập vào.
 * @param {string} selectedGoogleVoice - Giọng nói được chọn (e.g., 'en-US-Wavenet-D').
 * @param {string} languageCode - Mã ngôn ngữ (e.g., 'en-US').
 * @param {number} speechRate - Tốc độ đọc (e.g., 1.0).
 * @returns {Promise<object>} Promise trả về phản hồi từ API với dạng blob.
 */
export const generateAudio = async (text, selectedGoogleVoice, languageCode, speechRate) => {
    return await axiosClient({
        method: 'post',
        url: '/api/texttospeech/synthesize',
        data: {
            text: text,
            voiceName: selectedGoogleVoice,
            languageCode: languageCode,
            speechRate: speechRate,
        },
        responseType: 'blob',
    });
};