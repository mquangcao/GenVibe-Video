'use client';

export class CloudinaryService {
  constructor(config) {
    this.config = config;
  }

  /**
   * Upload video blob to Cloudinary
   */
  async uploadVideo(videoBlob, options = {}) {
    console.log('☁️ Starting Cloudinary upload...');
    console.log('📊 Video blob size:', (videoBlob.size / 1024 / 1024).toFixed(2), 'MB');

    const formData = new FormData();
    formData.append('file', videoBlob);
    formData.append('upload_preset', this.config.uploadPreset);
    formData.append('resource_type', 'video');

    if (options.publicId) {
      formData.append('public_id', options.publicId);
    }

    if (options.folder) {
      formData.append('folder', options.folder);
    }

    if (options.tags && options.tags.length > 0) {
      formData.append('tags', options.tags.join(','));
    }

    // Add timestamp for unique naming if no publicId provided
    if (!options.publicId) {
      const timestamp = Date.now();
      formData.append('public_id', `edited-video-${timestamp}`);
    }

    try {
      console.log('🚀 Uploading to Cloudinary...');
      console.log('🔧 Upload config:', {
        cloudName: this.config.cloudName,
        uploadPreset: this.config.uploadPreset,
        publicId: options.publicId,
        folder: options.folder,
        tags: options.tags,
      });

      const response = await fetch(`https://api.cloudinary.com/v1_1/${this.config.cloudName}/video/upload`, {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Upload response status:', response);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Cloudinary error response:', errorText);

        let errorMessage = `Upload failed (${response.status})`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(`Cloudinary upload failed: ${errorMessage}`);
      }

      const result = await response.json();
      console.log('✅ Cloudinary upload successful!');
      console.log('📋 Result:', {
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        bytes: result.bytes,
        duration: result.duration,
      });

      return result;
    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      throw new Error(`Failed to upload to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get optimized video URL from Cloudinary
   */
  getOptimizedVideoUrl(publicId, options = {}) {
    const transformations = [];

    if (options.quality) {
      transformations.push(`q_${options.quality}`);
    }

    if (options.format) {
      transformations.push(`f_${options.format}`);
    }

    if (options.width || options.height) {
      const w = options.width ? `w_${options.width}` : '';
      const h = options.height ? `h_${options.height}` : '';
      const c = options.crop ? `c_${options.crop}` : 'c_fit';
      transformations.push([w, h, c].filter(Boolean).join(','));
    }

    const transformString = transformations.length > 0 ? `/${transformations.join('/')}` : '';

    return `https://res.cloudinary.com/${this.config.cloudName}/video/upload${transformString}/${publicId}`;
  }

  /**
   * Get video thumbnail from Cloudinary
   */
  getVideoThumbnail(publicId, options = {}) {
    const transformations = [];

    if (options.width || options.height) {
      const w = options.width ? `w_${options.width}` : '';
      const h = options.height ? `h_${options.height}` : '';
      transformations.push([w, h, 'c_fill'].filter(Boolean).join(','));
    }

    if (options.time) {
      transformations.push(`so_${options.time}`);
    }

    const transformString = transformations.length > 0 ? `/${transformations.join('/')}` : '';

    return `https://res.cloudinary.com/${this.config.cloudName}/video/upload${transformString}/f_jpg/${publicId}.jpg`;
  }

  /**
   * Delete video from Cloudinary
   */
  async deleteVideo(publicId) {
    try {
      // Note: This requires server-side implementation with API secret
      console.log('🗑️ Delete video from Cloudinary:', publicId);
      // Implementation would need backend API call
      return true;
    } catch (error) {
      console.error('❌ Failed to delete from Cloudinary:', error);
      return false;
    }
  }
}

// FIXED: Use demo Cloudinary account for testing
export const cloudinaryService = new CloudinaryService({
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET, // Default preset that should work
});
