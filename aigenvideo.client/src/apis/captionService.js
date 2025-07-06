import axiosClient from './axiosClient';

/**
 * Gửi file audio lên backend và nhận lại nội dung phụ đề SRT.
 * @param {Blob} audioBlob - Blob của file audio hoàn chỉnh.
 * @returns {Promise<string>} - Promise giải quyết thành chuỗi nội dung SRT.
 */
export const generateCaptionsFromApi = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audioFile', audioBlob, 'audio_for_caption.mp3');

    const response = await axiosClient.post('/VideoGeneration/generate-captions-from-file', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    // Backend trả về { success: true, srts: "..." }
    if (response.data && response.data.success) {
        return response.data.srts;
    } else {
        throw new Error(response.data.error || 'Failed to generate captions from API');
    }
};