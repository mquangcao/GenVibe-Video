const CLOUD_NAME = 'dj88dmrqe';
const UPLOAD_PRESET = 'GenVideoProject';

export const uploadToCloudinary = async (file, folder, resourceType = 'auto') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);
    formData.append('resource_type', resourceType);

    const endpoint = resourceType === 'video' ? 'video' : resourceType === 'image' ? 'image' : 'raw';
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpoint}/upload`, {
        method: 'POST',
        body: formData,
    });

    const result = await response.json();

    if (!result.secure_url) {
        throw new Error(result.error?.message || `Cloudinary upload failed for ${folder}`);
    }

    return result.secure_url;
};

export const uploadBlobToCloudinary = async (blob, folder, resourceType = 'auto') => {
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);
    formData.append('resource_type', resourceType);

    const endpoint = resourceType === 'video' ? 'video' : 'raw';
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpoint}/upload`, {
        method: 'POST',
        body: formData,
    }).then((res) => res.json());

    if (!response.secure_url) {
        throw new Error(response.error?.message || `Cloudinary upload failed for ${folder}`);
    }
    return response.secure_url;
};