/**
 * Creates an SRT subtitle file from text that matches the timing of images in the video
 * @param {string} text - The full script text
 * @param {string} filename - Name for the downloaded file
 * @param {number} audioDuration - Total audio duration in seconds
 * @param {number} imageCount - Number of images in the video
 * @returns {void}
 */
export function createSyncedSRT(text, filename = 'subtitles', audioDuration, imageCount) {
    if (!text || !audioDuration || !imageCount) {
        console.error('Missing required parameters for SRT creation');
        return;
    }

    // Split text into segments matching the number of images
    const segments = splitTextIntoSegments(text, imageCount);

    // Calculate duration per image/segment
    const segmentDuration = audioDuration / imageCount;

    // Format to SRT
    let srtContent = '';

    segments.forEach((segment, index) => {
        // Calculate start and end times for this segment
        const startTime = index * segmentDuration;
        const endTime = (index + 1) * segmentDuration;

        // Add subtitle entry
        srtContent += `${index + 1}\n`;
        srtContent += `${formatSRTTime(startTime)} --> ${formatSRTTime(endTime)}\n`;
        srtContent += `${segment.trim()}\n\n`;
    });

    // Create and download the file
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Formats time in seconds to SRT timestamp format (00:00:00,000)
 * @param {number} timeInSeconds - Time in seconds
 * @returns {string} - Formatted SRT timestamp
 */
function formatSRTTime(timeInSeconds) {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds - Math.floor(timeInSeconds)) * 1000);

    return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)},${padZero(milliseconds, 3)}`;
}

/**
 * Pads a number with leading zeros
 * @param {number} num - Number to pad
 * @param {number} size - Desired length
 * @returns {string} - Padded number
 */
function padZero(num, size = 2) {
    let s = num.toString();
    while (s.length < size) s = '0' + s;
    return s;
}

/**
 * Splits text into approximately equal segments
 * @param {string} text - Full text to split
 * @param {number} segmentCount - Number of segments to create
 * @returns {string[]} - Array of text segments
 */
function splitTextIntoSegments(text, segmentCount) {
    // Simple approach: split by sentences then distribute evenly
    const sentences = text.replace(/([.!?])\s+/g, "$1|").split("|");

    const segments = [];
    const sentencesPerSegment = Math.ceil(sentences.length / segmentCount);

    for (let i = 0; i < segmentCount; i++) {
        const start = i * sentencesPerSegment;
        const end = Math.min(start + sentencesPerSegment, sentences.length);

        if (start < sentences.length) {
            segments.push(sentences.slice(start, end).join(' '));
        } else {
            // If we run out of sentences, use the last one
            segments.push(sentences[sentences.length - 1]);
        }
    }

    return segments;
}