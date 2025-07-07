import { fetchFile } from '@ffmpeg/ffmpeg';

/**
 * Creates SRT subtitle content from scene summaries and their durations
 * @param {Array} scenes - Array of scene objects with summary text
 * @param {Array} audioDurations - Array of audio durations for each scene
 * @returns {string} - SRT formatted subtitle content
 */
export function generateSRTSubtitles(scenes, audioDurations) {
    let srtContent = '';
    let currentTime = 0;

    for (let i = 0; i < scenes.length; i++) {
        const startTime = currentTime;
        const endTime = currentTime + audioDurations[i];

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

        currentTime = endTime;
    }

    return srtContent;
}

/**
 * Creates a video from images and individual audio files with subtitles using FFmpeg
 * @param {Object} ffmpeg - FFmpeg instance
 * @param {Array} images - Array of image objects with urls
 * @param {Array} audioUrls - Array of audio URLs, one for each image
 * @param {Array} scenes - Array of scene objects with summary text for subtitles
 * @param {Object} options - Optional configuration
 * @returns {Promise<{videoUrl: string, subtitleUrl: string}>} - URLs of the created video and subtitle file
 */
export async function createVideoFromImagesAndIndividualAudiosWithSubtitles(ffmpeg, images, audioUrls, scenes, options = {}) {
    if (!ffmpeg || !images.length || !audioUrls.length || !scenes.length ||
        images.length !== audioUrls.length || images.length !== scenes.length) {
        throw new Error('Missing required parameters or mismatched counts for video creation');
    }

    const {
        embedSubtitles = false,
        subtitleStyle = {
            fontSize: 20,
            fontColor: '#ffffff',
            backgroundColor: '#000000',
            position: 'bottom'
        },
        existingSrtContent = null,
    } = options;

    try {
        console.log('Starting video creation with subtitles...');

        // === BƯỚC 1: TẢI FONT VÀO BỘ NHỚ FFMPEG ===
        // Đây là bước bắt buộc để "đốt cháy" phụ đề
        const fontUrl = '/fonts/Roboto-Regular.ttf'; // Đường dẫn tới file font trong thư mục `public`
        const fontFileNameInFS = 'font.ttf';
        console.log(`Loading font from ${fontUrl}...`);
        ffmpeg.FS('writeFile', fontFileNameInFS, await fetchFile(fontUrl));
        console.log("Font loaded successfully into FFmpeg's virtual filesystem.");
        // ===============================================

        const audioDurations = [];
        // ... (phần xử lý audio để lấy audioDurations giữ nguyên) ...
        for (let i = 0; i < audioUrls.length; i++) {
            const audioResponse = await fetch(audioUrls[i], { credentials: 'omit' });
            const audioData = await audioResponse.blob();
            const audioArrayBuffer = await audioData.arrayBuffer();
            ffmpeg.FS('writeFile', `audio${i}.mp3`, new Uint8Array(audioArrayBuffer));
            const audioElement = new Audio();
            audioElement.src = URL.createObjectURL(audioData);
            const audioDuration = await new Promise((resolve) => {
                audioElement.onloadedmetadata = () => resolve(audioElement.duration);
                audioElement.onerror = () => { resolve(5); };
            });
            audioDurations.push(audioDuration);
        }

        let srtContent;
        if (existingSrtContent && typeof existingSrtContent === 'string' && existingSrtContent.trim() !== '') {
            console.log('Using existing SRT content from backend.');
            srtContent = existingSrtContent;
        } else {
            console.warn('Fallback: Generating SRT content on client-side.');
            srtContent = generateSRTSubtitles(scenes, audioDurations);
        }
        ffmpeg.FS('writeFile', 'subtitles.srt', new TextEncoder().encode(srtContent));
        
        // ... (phần xử lý ảnh và tạo video segments giữ nguyên) ...
        for (let i = 0; i < images.length; i++) {
            const imgResponse = await fetch(images[i].url, { credentials: 'omit' });
            const imgBlob = await imgResponse.blob();
            const imgArrayBuffer = await imgBlob.arrayBuffer();
            ffmpeg.FS('writeFile', `img${i}.jpg`, new Uint8Array(imgArrayBuffer));
        }

        for (let i = 0; i < images.length; i++) {
             await ffmpeg.run('-loop', '1', '-i', `img${i}.jpg`, '-i', `audio${i}.mp3`, '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-t', audioDurations[i].toString(), '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', `segment${i}.mp4`);
        }

        let concatText = images.map((_, i) => `file 'segment${i}.mp4'`).join('\n');
        ffmpeg.FS('writeFile', 'concat_list.txt', concatText);

        await ffmpeg.run('-f', 'concat', '-safe', '0', '-i', 'concat_list.txt', '-c', 'copy', 'temp_video.mp4');

        if (embedSubtitles) {
            console.log('Embedding hard subtitles into video...');
            const fontSize = subtitleStyle.fontSize || 20;

            // === BƯỚC 2: CẬP NHẬT BỘ LỌC ĐỂ SỬ DỤNG FONT ===
            const fontPathInFS = fontFileNameInFS;
            const subtitleFilter = `subtitles=subtitles.srt:force_style='FontName=Roboto,FontSize=${fontSize}':fontfile=${fontPathInFS}`;
            console.log('Using subtitle filter with font:', subtitleFilter);
            // =================================================

            try {
                await ffmpeg.run('-y', '-i', 'temp_video.mp4', '-vf', subtitleFilter, '-c:a', 'copy', 'output.mp4');
                console.log('Hard subtitles embedded successfully');
            } catch (error) {
                console.error('Error embedding hard subtitles:', error);
                await ffmpeg.run('-y', '-i', 'temp_video.mp4', '-c', 'copy', 'output.mp4');
                console.log('Fallback: Created video without embedded subtitles');
            }
        } else {
            await ffmpeg.run('-y', '-i', 'temp_video.mp4', '-c', 'copy', 'output.mp4');
        }

        console.log('FFmpeg processing completed');

        const videoData = ffmpeg.FS('readFile', 'output.mp4');
        const subtitleData = ffmpeg.FS('readFile', 'subtitles.srt');

        const videoBlob = new Blob([videoData.buffer], { type: 'video/mp4' });
        const subtitleBlob = new Blob([subtitleData.buffer], { type: 'text/plain' });

        const videoURL = URL.createObjectURL(videoBlob);
        const subtitleURL = URL.createObjectURL(subtitleBlob);

        // === BƯỚC 3: DỌN DẸP CÁC FILE, BAO GỒM CẢ FONT ===
        try {
            images.forEach((_, i) => {
                ffmpeg.FS('unlink', `img${i}.jpg`);
                ffmpeg.FS('unlink', `audio${i}.mp3`);
                ffmpeg.FS('unlink', `segment${i}.mp4`);
            });
            ffmpeg.FS('unlink', 'concat_list.txt');
            ffmpeg.FS('unlink', 'subtitles.srt');
            ffmpeg.FS('unlink', 'temp_video.mp4');
            ffmpeg.FS('unlink', 'output.mp4');
            ffmpeg.FS('unlink', fontFileNameInFS); // Dọn dẹp file font
        } catch (e) {
            console.warn('Failed to unlink some temp files:', e);
        }
        // =================================================

        return { videoUrl: videoURL, subtitleUrl: subtitleURL };
    } catch (error) {
        console.error('Error in video creation with subtitles:', error);
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
