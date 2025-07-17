import { useState } from 'react';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import {
  createVideoFromImagesAndIndividualAudios,
  createVideoFromImagesAndIndividualAudiosWithSubtitles,
} from '@/utils/videoCreationUtils';
import { saveFullVideoData } from '@/apis/saveFullVideoData';
import { generateAudio } from '@/apis/audioService';
import { uploadBlobToCloudinary } from '@/services/cloudinaryService';

export const useVideoProcessor = () => {
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [subtitleUrl, setSubtitleUrl] = useState(null);
  const { ffmpeg, loaded: ffmpegLoaded, error: ffmpegError, progress } = useFFmpeg();

  const createVideoWithIndividualAudios = async (
    customScenes,
    videoResult,
    images,
    selectedGoogleVoice,
    speechRate,
    subtitleSettings,
    generateAudioBlob,
    setActiveTab
  ) => {
    console.log('First log');
    console.log(ffmpegLoaded);
    if (!ffmpegLoaded) {
      return console.error('Cannot create video: FFmpeg not loaded');
    }

    // Use custom scenes if available, otherwise fall back to generated content
    const scenesToUse = customScenes.length > 0 ? customScenes : videoResult;
    if (!scenesToUse || scenesToUse.length === 0) {
      return console.error('No scenes available for video creation');
    }

    console.log(`Creating video with ${scenesToUse.length} scenes (${customScenes.length > 0 ? 'custom' : 'generated'})`, customScenes);

    // Create image objects from scenes or use existing images
    let imagesToUse = [];
    if (customScenes.length > 0) {
      // For custom scenes, try to use scene images first, then fall back to uploaded images
      const scenesWithImages = customScenes.filter((scene) => scene.imageUrl && scene.imageUrl.trim() !== '');

      if (scenesWithImages.length > 0) {
        // Use images from custom scenes
        imagesToUse = scenesWithImages.map((scene, index) => ({
          id: scene.id,
          url: scene.imageUrl,
          name: `scene-${index + 1}`,
        }));
      } else {
        // Fallback to uploaded images if custom scenes don't have images
        console.warn('Custom scenes found but no images attached. Falling back to uploaded images.');
        const minCount = Math.min(images.length, scenesToUse.length);
        imagesToUse = images.slice(0, minCount);

        if (imagesToUse.length === 0) {
          alert(
            'No images available for video creation. Please either:\n1. Add images to your custom scenes, or\n2. Upload images in the Images tab'
          );
          return;
        }
      }
    } else {
      // Use existing images for generated content
      const minCount = Math.min(images.length, scenesToUse.length);
      imagesToUse = images.slice(0, minCount);
    }

    console.log(`Using ${imagesToUse.length} images for video creation`, imagesToUse);

    if (imagesToUse.length === 0) {
      alert('No images available for video creation. Please add images to your scenes or upload images in the Images tab.');
      return;
    }

    const minCount = Math.min(imagesToUse.length, scenesToUse.length);
    const usedImages = imagesToUse.slice(0, minCount);
    const usedScenes = scenesToUse.slice(0, minCount);

    setIsProcessingVideo(true);

    try {
      console.log('Generating individual audio files for each scene...');
      const audioUrls = [];
      for (let i = 0; i < usedScenes.length; i++) {
        const audioUrl = await generateAudioBlob(usedScenes[i].summary, selectedGoogleVoice, speechRate);
        audioUrls.push(audioUrl);
      }

      // Upload all audio blobs to Cloudinary
      console.log('Generating full audio track...');
      const fullScript = usedScenes.map((scene) => scene.summary).join(' ');
      const fullAudio = await generateAudio({ text: fullScript, selectedGoogleVoice, speechRate }).then((response) => response.data);
      const finalAudioUrl = await uploadBlobToCloudinary(fullAudio, 'generated-audio', 'video');

      let result;
      if (subtitleSettings.enabled) {
        console.log('Creating video with subtitles...');
        const subtitleOptions = {
          embedSubtitles: subtitleSettings.embedInVideo,
          subtitleStyle: {
            fontSize: subtitleSettings.fontSize,
            fontColor: subtitleSettings.fontColor,
            backgroundColor: subtitleSettings.backgroundColor,
            position: subtitleSettings.position,
          },
        };
        console.log('Subtitle options:', subtitleOptions);
        result = await createVideoFromImagesAndIndividualAudiosWithSubtitles(ffmpeg, usedImages, audioUrls, usedScenes, subtitleOptions);
      } else {
        console.log('Creating video without subtitles...');
        const videoURL = await createVideoFromImagesAndIndividualAudios(ffmpeg, usedImages, audioUrls);
        result = { videoUrl: videoURL, subtitleUrl: null };
      }

      setVideoUrl(result.videoUrl);
      setSubtitleUrl(result.subtitleUrl);
      setActiveTab('videoReview');

      console.log('Uploading final assets to Cloudinary...');
      const videoBlob = await fetch(result.videoUrl).then((res) => res.blob());

      const videoUploadPromise = uploadBlobToCloudinary(videoBlob, 'videos', 'video');

      const srtUploadPromise = result.subtitleUrl
        ? fetch(result.subtitleUrl)
            .then((res) => res.blob())
            .then((srtBlob) => uploadBlobToCloudinary(srtBlob, 'subtitles', 'raw'))
        : Promise.resolve(null);

      const [finalVideoUrl, finalSrtUrl] = await Promise.all([videoUploadPromise, srtUploadPromise]);
      console.log('Final assets uploaded successfully.');

      console.log('Saving video data to database...');
      const videoDataPayload = {
        ImageListUrl: usedImages.map((img) => img.url),
        VideoUrl: finalVideoUrl,
        Srts: finalSrtUrl || '',
        Captions: usedScenes.map((s) => s.summary).join('\n\n'),
        AudioFileUrl: finalAudioUrl,
        CreatedBy: 'current_user_id',
        // Add metadata about whether custom scenes were used
        IsCustomContent: customScenes.length > 0,
        SceneCount: usedScenes.length,
        Title: 'Video Title', // Replace with actual title input if available
      };
      await saveFullVideoData(videoDataPayload);

      // Cleanup
      audioUrls.forEach((url) => URL.revokeObjectURL(url));
      URL.revokeObjectURL(result.videoUrl);
      if (result.subtitleUrl) {
        URL.revokeObjectURL(result.subtitleUrl);
      }

      console.log('Video creation completed successfully!');
    } catch (error) {
      console.error('Error creating video:', error);
      alert(`Failed to create video: ${error.message}`);
    } finally {
      setIsProcessingVideo(false);
    }
  };

  return {
    isProcessingVideo,
    videoUrl,
    subtitleUrl,
    ffmpegLoaded,
    ffmpegError,
    progress,
    createVideoWithIndividualAudios,
    setVideoUrl,
    setSubtitleUrl,
  };
};
