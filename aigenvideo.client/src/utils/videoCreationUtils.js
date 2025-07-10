import { fetchFile } from '@ffmpeg/ffmpeg';
/**
 * Converts hex color to FFmpeg ASS/SSA format
 * FFmpeg ASS uses BGR format instead of RGB, so we need to reverse the color order
 * @param {string} hexColor - Hex color (e.g., '#ffffff')
 * @returns {string} - FFmpeg ASS color format (e.g., '&Hffffff')
 */
function hexToFFmpegColor(hexColor) {
    // Remove # if present
    const cleanHex = hexColor.replace('#', '');

    // Extract RGB components
    const r = cleanHex.substring(0, 2);
    const g = cleanHex.substring(2, 4);
    const b = cleanHex.substring(4, 6);

    // Convert to BGR format for ASS/SSA (Blue-Green-Red instead of Red-Green-Blue)
    const bgrHex = `${b}${g}${r}`;

    return `&H${bgrHex}`;
}
/**
 * Converts hex color to RGB values for drawtext filter
 * @param {string} hexColor - Hex color (e.g., '#ffffff')
 * @returns {string} - RGB color format (e.g., '255,255,255')
 */
function hexToRGB(hexColor) {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r},${g},${b}`;
}

/**
 * Creates SRT subtitle content from scene summaries with custom segment durations
 * @param {Array} scenes - Array of scene objects with summary text
 * @param {Array} segmentDurations - Array of desired segment durations (overrides audio durations)
 * @param {number} transitionDuration - Duration of silent transitions between scenes
 * @returns {string} - SRT formatted subtitle content
 */
export function generateSRTSubtitlesWithCustomDurations(scenes, segmentDurations, transitionDuration = 1) {
    let srtContent = '';
    let currentTime = 0;

    for (let i = 0; i < scenes.length; i++) {
        const startTime = currentTime;
        const endTime = currentTime + segmentDurations[i];

        // Format time for SRT (HH:MM:SS,mmm)
        const formatTime = (timeInSeconds) => {
            const hours = Math.floor(timeInSeconds / 3600);
            const minutes = Math.floor((timeInSeconds % 3600) / 60);
            const seconds = Math.floor(timeInSeconds % 60);
            const milliseconds = Math.floor((timeInSeconds - Math.floor(timeInSeconds)) * 1000);

            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
        };

        // Add SRT subtitle entry
        srtContent += `${i + 1}\n`;
        srtContent += `${formatTime(startTime)} --> ${formatTime(endTime)}\n`;
        srtContent += `${scenes[i].summary.trim()}\n\n`;

        // Move to next segment start time (segment duration + transition duration)
        currentTime = endTime + (i < scenes.length - 1 ? transitionDuration : 0);
    }

    return srtContent;
}

/**
 * Creates a video from images and individual audio files with custom segment durations and subtitles using FFmpeg
 * @param {Object} ffmpeg - FFmpeg instance
 * @param {Array} images - Array of image objects with urls
 * @param {Array} audioUrls - Array of audio URLs, one for each image
 * @param {Array} scenes - Array of scene objects with summary text for subtitles
 * @param {Object} options - Optional configuration
 * @param {Array} options.segmentDurations - Array of custom durations for each segment (e.g., [4, 2] for 4s and 2s segments)
 * @param {number} options.transitionDuration - Duration of transition between segments in seconds (default: 1)
 * @param {boolean} options.embedSubtitles - Whether to embed subtitles into video (default: false)
 * @param {Object} options.subtitleStyle - Subtitle styling options
 * @returns {Promise<{videoUrl: string, subtitleUrl: string}>} - URLs of the created video and subtitle file
 */
export async function createVideoFromImagesAndIndividualAudiosWithSubtitles(ffmpeg, images, audioUrls, scenes, options = {}) {
    if (!ffmpeg || !images.length || !audioUrls.length || !scenes.length ||
        images.length !== audioUrls.length || images.length !== scenes.length) {
        throw new Error('Missing required parameters or mismatched counts for video creation');
    }

    const transitionDuration = options.transitionDuration || 1;

    try {
        console.log('Starting video creation with custom segment durations and subtitles...');
        console.log(`Transition duration: ${transitionDuration}s`);

        const audioDurations = [];

        // Process audio files and get durations
        console.log('Processing audio files...');
        for (let i = 0; i < audioUrls.length; i++) {
            const audioResponse = await fetch(audioUrls[i], { credentials: 'omit' });
            if (!audioResponse.ok) {
                throw new Error(`Failed to fetch audio ${i}: ${audioResponse.status} ${audioResponse.statusText}`);
            }
            const audioData = await audioResponse.blob();
            const audioArrayBuffer = await audioData.arrayBuffer();

            ffmpeg.FS('writeFile', `audio${i}.mp3`, new Uint8Array(audioArrayBuffer));

            const audioElement = new Audio();
            audioElement.src = URL.createObjectURL(audioData);

            const audioDuration = await new Promise((resolve) => {
                audioElement.onloadedmetadata = () => resolve(audioElement.duration);
                audioElement.onerror = () => {
                    console.warn(`Could not determine audio duration for audio ${i}, using fallback`);
                    resolve(5);
                };
            });

            audioDurations.push(audioDuration);
            console.log(`Audio ${i} duration:`, audioDuration, 'seconds');
        }

        // Use custom segment durations if provided, otherwise use audio durations
        const segmentDurations = options.segmentDurations || audioDurations;
        console.log('Using segment durations:', segmentDurations);

        // Generate SRT subtitles with custom timing
        console.log('Generating subtitles with custom segment timing...');
        const srtContent = generateSRTSubtitlesWithCustomDurations(scenes, segmentDurations, transitionDuration);
        console.log('Generated SRT content length:', srtContent.length);
        console.log('SRT preview:', srtContent.substring(0, 200) + '...');

        ffmpeg.FS('writeFile', 'subtitles.srt', new TextEncoder().encode(srtContent));

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

        // Create individual video segments with custom durations
        console.log('Creating individual video segments with custom durations...');
        for (let i = 0; i < images.length; i++) {
            const segmentDuration = segmentDurations[i] + 1;
            const audioDuration = audioDurations[i];

            console.log(`Creating segment ${i}: video=${segmentDuration}s, audio=${audioDuration}s`);

            if (segmentDuration <= audioDuration) {
                // Segment duration is shorter or equal to audio - trim audio
                await ffmpeg.run(
                    '-i', `audio${i}.mp3`,
                    '-af', 'apad=pad_dur=1s',
                    `audio${i}.mp3`
                )

                await ffmpeg.run(
                    '-loop', '1',
                    '-i', `img${i}.jpg`,
                    '-i', `audio${i}.mp3`,
                    '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black',
                    '-c:v', 'libx264',
                    '-t', segmentDuration.toString(),
                    '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac',
                    '-b:a', '192k',
                    `segment${i}.mp4`
                );
            } else {
                // Segment duration is longer than audio - pad audio with silence
                await ffmpeg.run(
                    '-loop', '1',
                    '-i', `img${i}.jpg`,
                    '-i', `audio${i}.mp3`,
                    '-filter_complex',
                    `[1:a]apad=pad_dur=${segmentDuration - audioDuration}[a]`,
                    '-map', '0:v',
                    '-map', '[a]',
                    '-vf', 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black',
                    '-c:v', 'libx264',
                    '-t', segmentDuration.toString(),
                    '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac',
                    '-b:a', '192k',
                    `segment${i}.mp4`
                );
            }
            console.log(`Created segment ${i} with duration ${segmentDuration}s`);
        }

        if (images.length === 1) {
            // Single segment, no transitions needed
            await ffmpeg.run('-y', '-i', 'segment0.mp4', '-c', 'copy', 'temp_video.mp4');
        } else {
            // Create transition segments (silent video with fade effect)
            console.log('Creating transition segments...');
            for (let i = 0; i < images.length - 1; i++) {
                const currentImage = `img${i}.jpg`;
                const nextImage = `img${i + 1}.jpg`;

                // Create transition with crossfade effect but no audio
                await ffmpeg.run(
                    '-loop', '1', '-i', currentImage,
                    '-loop', '1', '-i', nextImage,
                    '-filter_complex',
                    `[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black[v0];[1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black[v1];[v0][v1]xfade=transition=fade:duration=${transitionDuration}:offset=0[v]`,
                    '-map', '[v]',
                    '-c:v', 'libx264',
                    '-t', transitionDuration.toString(),
                    '-pix_fmt', 'yuv420p',
                    '-an', // No audio for transition
                    `transition${i}.mp4`
                );
                console.log(`Created transition ${i} with duration ${transitionDuration}s`);
            }

            // Create concat file for segments and transitions
            let concatText = '';
            for (let i = 0; i < images.length; i++) {
                concatText += `file 'segment${i}.mp4'\n`;
                if (i < images.length - 1) {
                    concatText += `file 'transition${i}.mp4'\n`;
                }
            }
            ffmpeg.FS('writeFile', 'concat_list.txt', new TextEncoder().encode(concatText));

            console.log('Concatenating video segments with transitions...');
            await ffmpeg.run(
                '-f', 'concat',
                '-safe', '0',
                '-i', 'concat_list.txt',
                '-c', 'copy',
                'temp_video.mp4'
            );
        }

        // Add subtitles to the video
        if (options.embedSubtitles) {
            // Embed subtitles as burned-in text (hard subtitles)
            console.log('Embedding hard subtitles into video...');

            const fontSize = options.subtitleStyle?.fontSize || 24;
            const fontColor = options.subtitleStyle?.fontColor || '#ffffff';
            const backgroundColor = options.subtitleStyle?.backgroundColor || '#000000';
            const position = options.subtitleStyle?.position || 'bottom';
            const ffmpegFontColor = hexToFFmpegColor(fontColor);
            const ffmpegBackgroundColor = hexToFFmpegColor(backgroundColor);

            console.log('Subtitle style:', { ffmpegFontColor, ffmpegBackgroundColor, fontSize, position });

            try {
                // Try to load font file for subtitle rendering
                await ffmpeg.FS('writeFile', 'tmp/Roboto-Regular.ttf', await fetchFile('/fonts/Roboto-Regular.ttf'));
                const subtitleFilter = `subtitles=subtitles.srt:fontsdir=/tmp:force_style='FontName=Roboto, FontSize=${fontSize}, FontColor=${ffmpegFontColor}, BackgroundColor=${ffmpegBackgroundColor}, Alignment=2, MarginV=20'`;
                console.log('Using subtitle filter:', subtitleFilter);

                await ffmpeg.run(
                    '-i', 'temp_video.mp4',
                    '-vf', subtitleFilter,
                    '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p',
                    'output.mp4'
                );
                console.log('Hard subtitles embedded successfully');
            } catch (error) {
                console.error('Error embedding hard subtitles:', error);
                console.log('Trying fallback subtitle approach...');

                try {
                    // Fallback: Use simple subtitle filter without custom font
                    const fallbackFilter = `subtitles=subtitles.srt:force_style='FontSize=${fontSize}, FontColor=${ffmpegFontColor}, BackgroundColor=${ffmpegBackgroundColor}, Alignment=2'`;
                    await ffmpeg.run(
                        '-i', 'temp_video.mp4',
                        '-vf', fallbackFilter,
                        '-c:v', 'libx264',
                        '-pix_fmt', 'yuv420p',
                        'output.mp4'
                    );
                    console.log('Fallback subtitles embedded successfully');
                } catch (fallbackError) {
                    console.error('Fallback subtitle embedding failed:', fallbackError);
                    // Final fallback: just copy the video without subtitles
                    await ffmpeg.run('-y', '-i', 'temp_video.mp4', '-c', 'copy', 'output.mp4');
                    console.log('Final fallback: Created video without embedded subtitles');
                }
            }
        } else {
            // For external subtitles, just copy the video
            console.log('Creating video with external subtitle support...');
            await ffmpeg.run('-y', '-i', 'temp_video.mp4', '-c', 'copy', 'output.mp4');
            console.log('Video created for external subtitles');
        }

        console.log('FFmpeg processing with custom durations and subtitles completed');

        // Verify the output file
        const outputStat = ffmpeg.FS('stat', 'output.mp4');
        console.log('Output video file size:', outputStat.size, 'bytes');
        if (outputStat.size === 0) {
            throw new Error('Generated video has zero size');
        }

        // Read the output files
        const videoData = ffmpeg.FS('readFile', 'output.mp4');
        const subtitleData = ffmpeg.FS('readFile', 'subtitles.srt');

        // Create URLs
        const videoBlob = new Blob([videoData.buffer], { type: 'video/mp4' });
        const subtitleBlob = new Blob([subtitleData.buffer], { type: 'text/plain' });

        const videoURL = URL.createObjectURL(videoBlob);
        const subtitleURL = URL.createObjectURL(subtitleBlob);

        console.log('Video URL created:', videoURL);
        console.log('Subtitle URL created:', subtitleURL);

        // Clean up
        for (let i = 0; i < images.length; i++) {
            try {
                ffmpeg.FS('unlink', `img${i}.jpg`);
                ffmpeg.FS('unlink', `audio${i}.mp3`);
                ffmpeg.FS('unlink', `segment${i}.mp4`);
            } catch (e) {
                console.warn(`Failed to unlink files for segment ${i}:`, e);
            }
        }

        // Clean up transition files
        for (let i = 0; i < images.length - 1; i++) {
            try {
                ffmpeg.FS('unlink', `transition${i}.mp4`);
            } catch (e) {
                console.warn(`Failed to unlink transition file ${i}:`, e);
            }
        }

        try {
            ffmpeg.FS('unlink', 'subtitles.srt');
            ffmpeg.FS('unlink', 'temp_video.mp4');
            ffmpeg.FS('unlink', 'output.mp4');
            ffmpeg.FS('unlink', 'tmp/Roboto-Regular.ttf');
            ffmpeg.FS('unlink', 'concat_list.txt');
        } catch (e) {
            console.warn('Failed to unlink some temp files:', e);
        }

        return { videoUrl: videoURL, subtitleUrl: subtitleURL };
    } catch (error) {
        console.error('Error in video creation with custom durations and subtitles:', error);
        throw error;
    }
}

/**
 * Creates a video from images and individual audio files using FFmpeg
 * @param {Object} ffmpeg - FFmpeg instance
 * @param {Array} images - Array of image objects with urls
 * @param {Array} audioUrls - Array of audio URLs, one for each image
 * @param {Object} options - Optional configuration
 * @returns {Promise<string>} - URL of the created video
 */
export async function createVideoFromImagesAndIndividualAudios(ffmpeg, images, audioUrls, options = {}) {
    if (!ffmpeg || !images.length || !audioUrls.length || images.length !== audioUrls.length) {
        throw new Error('Missing required parameters or mismatched image/audio counts for video creation');
    }

    try {
        console.log('Starting video creation with individual audio files...');

        const audioDurations = [];

        console.log('Processing audio files...');
        for (let i = 0; i < audioUrls.length; i++) {
            const audioResponse = await fetch(audioUrls[i], { credentials: 'omit' });
            if (!audioResponse.ok) {
                throw new Error(`Failed to fetch audio ${i}: ${audioResponse.status} ${audioResponse.statusText}`);
            }
            const audioData = await audioResponse.blob();
            const audioArrayBuffer = await audioData.arrayBuffer();

            ffmpeg.FS('writeFile', `audio${i}.mp3`, new Uint8Array(audioArrayBuffer));

            const audioElement = new Audio();
            audioElement.src = URL.createObjectURL(audioData);

            const audioDuration = await new Promise((resolve) => {
                audioElement.onloadedmetadata = () => resolve(audioElement.duration);
                audioElement.onerror = () => {
                    console.warn(`Could not determine audio duration for audio ${i}, using fallback`);
                    resolve(5);
                };
            });

            audioDurations.push(audioDuration);
            console.log(`Audio ${i} duration:`, audioDuration, 'seconds');
        }

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

        console.log('Creating individual video segments...');
        for (let i = 0; i < images.length; i++) {
            await ffmpeg.run(
                '-loop', '1',
                '-i', `img${i}.jpg`,
                '-i', `audio${i}.mp3`,
                '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
                '-c:v', 'libx264',
                '-t', audioDurations[i].toString(),
                '-pix_fmt', 'yuv420p',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-shortest',
                `segment${i}.mp4`
            );
            console.log(`Created segment ${i}`);
        }

        let concatText = '';
        for (let i = 0; i < images.length; i++) {
            concatText += `file 'segment${i}.mp4'\n`;
        }
        ffmpeg.FS('writeFile', 'concat_list.txt', new TextEncoder().encode(concatText));

        console.log('Concatenating video segments...');
        await ffmpeg.run(
            '-f', 'concat',
            '-safe', '0',
            '-i', 'concat_list.txt',
            '-c', 'copy',
            'output.mp4'
        );

        console.log('FFmpeg concatenation completed');

        const outputStat = ffmpeg.FS('stat', 'output.mp4');
        console.log('Output video file size:', outputStat.size, 'bytes');
        if (outputStat.size === 0) {
            throw new Error('Generated video has zero size');
        }

        const data = ffmpeg.FS('readFile', 'output.mp4');

        const blob = new Blob([data.buffer], { type: 'video/mp4' });
        const videoURL = URL.createObjectURL(blob);

        for (let i = 0; i < images.length; i++) {
            try {
                ffmpeg.FS('unlink', `img${i}.jpg`);
                ffmpeg.FS('unlink', `audio${i}.mp3`);
                ffmpeg.FS('unlink', `segment${i}.mp4`);
            } catch (e) {
                console.warn(`Failed to unlink files for segment ${i}:`, e);
            }
        }
        ffmpeg.FS('unlink', 'concat_list.txt');
        ffmpeg.FS('unlink', 'output.mp4');

        return videoURL;
    } catch (error) {
        console.error('Error in video creation:', error);
        throw error;
    }
}