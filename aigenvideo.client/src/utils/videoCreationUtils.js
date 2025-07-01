/**
 * Creates a video from images and audio using FFmpeg
 * @param {Object} ffmpeg - FFmpeg instance
 * @param {Array} images - Array of image objects with urls
 * @param {string} audioUrl - URL of the audio file
 * @param {Object} options - Optional configuration
 * @returns {Promise<string>} - URL of the created video
 */
export async function createVideoFromImagesAndAudio(ffmpeg, images, audioUrl, options = {}) {
    if (!ffmpeg || !images.length || !audioUrl) {
        throw new Error('Missing required parameters for video creation');
    }

    try {
        console.log('Starting video creation with FFmpeg...');

        // Download the audio file
        console.log('Fetching audio from:', audioUrl);
        const audioResponse = await fetch(audioUrl, { credentials: 'omit' });
        if (!audioResponse.ok) {
            throw new Error(`Failed to fetch audio: ${audioResponse.status} ${audioResponse.statusText}`);
        }
        const audioData = await audioResponse.blob();
        const audioArrayBuffer = await audioData.arrayBuffer();

        // Write audio to FFmpeg filesystem
        ffmpeg.FS('writeFile', 'audio.mp3', new Uint8Array(audioArrayBuffer));
        console.log('Audio file written successfully');

        // Get audio duration
        console.log('Determining audio duration...');
        const audioElement = new Audio();
        audioElement.src = URL.createObjectURL(audioData);

        const audioDuration = await new Promise((resolve) => {
            audioElement.onloadedmetadata = () => resolve(audioElement.duration);
            audioElement.onerror = () => {
                console.warn('Could not determine audio duration, using fallback');
                resolve(images.length * 5);
            };
        });
        console.log('Audio duration:', audioDuration, 'seconds');

        // Calculate slide duration
        const slideDuration = audioDuration / images.length;
        console.log('Each image will be shown for approximately', slideDuration, 'seconds');

        // Process images
        console.log(`Processing ${images.length} images...`);
        for (let i = 0; i < images.length; i++) {
            try {
                const imgResponse = await fetch(images[i].url, { credentials: 'omit' });
                if (!imgResponse.ok) {
                    throw new Error(`Failed to fetch image: ${imgResponse.status}`);
                }
                const imgBlob = await imgResponse.blob();
                const imgArrayBuffer = await imgBlob.arrayBuffer();
                ffmpeg.FS('writeFile', `img${i}.jpg`, new Uint8Array(imgArrayBuffer));
            } catch (error) {
                console.error(`Error processing image ${i + 1}:`, error);
                throw error;
            }
        }

        // Create a text file for the concat demuxer with explicit durations
        let concatText = '';
        for (let i = 0; i < images.length; i++) {
            // Format: file 'filename' + newline + duration X + newline
            concatText += `file 'img${i}.jpg'\nduration ${slideDuration.toFixed(6)}\n`;
        }
        // Add the last file entry again without duration (required by the concat demuxer)
        concatText += `file 'img${images.length - 1}.jpg'`;

        ffmpeg.FS('writeFile', 'sequence.txt', new TextEncoder().encode(concatText));

        console.log('Running FFmpeg with concat demuxer...');
        // Use the concat demuxer which properly handles image durations
        // Added scale filter to ensure dimensions are even numbers
        await ffmpeg.run(
            '-f', 'concat',
            '-safe', '0',
            '-i', 'sequence.txt',
            '-i', 'audio.mp3',
            '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',  // Ensure even dimensions
            '-c:v', 'libx264',
            '-vsync', 'vfr',
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac',
            '-b:a', '192k',
            '-shortest',
            'output.mp4'
        );

        console.log('FFmpeg command completed');

        // Verify the output file
        const outputStat = ffmpeg.FS('stat', 'output.mp4');
        console.log('Output video file size:', outputStat.size, 'bytes');
        if (outputStat.size === 0) {
            throw new Error('Generated video has zero size');
        }

        // Read the output file
        const data = ffmpeg.FS('readFile', 'output.mp4');

        // Create and return video URL
        const blob = new Blob([data.buffer], { type: 'video/mp4' });
        const videoURL = URL.createObjectURL(blob);

        // Clean up
        ffmpeg.FS('unlink', 'audio.mp3');
        ffmpeg.FS('unlink', 'sequence.txt');
        for (let i = 0; i < images.length; i++) {
            try {
                ffmpeg.FS('unlink', `img${i}.jpg`);
            } catch (e) {
                console.warn(`Failed to unlink img${i}.jpg:`, e);
            }
        }
        ffmpeg.FS('unlink', 'output.mp4');

        return videoURL;
    } catch (error) {
        console.error('Error in video creation:', error);
        throw error;
    }
}