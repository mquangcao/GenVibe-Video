export const generateSRTWithSentenceTiming = (text, totalDuration) => {
    const sentences = text.split(/(?<=[.!?])\s+/).filter((sentence) => sentence.trim().length > 0);

    if (sentences.length === 0) return '';

    const totalChars = text.length;
    const totalWords = text.trim().split(/\s+/).length;

    let srtContent = '';
    let index = 1;
    let currentStartTime = 0;

    sentences.forEach((sentence) => {
        const sentenceChars = sentence.length;
        const sentenceWords = sentence.trim().split(/\s+/).length;

        const charRatio = sentenceChars / totalChars;
        const wordRatio = sentenceWords / totalWords;

        const timeRatio = (charRatio + wordRatio) / 2;

        const duration = totalDuration * timeRatio;

        const endTime = currentStartTime + duration;

        const formatTime = (seconds) => {
            const date = new Date(seconds * 1000);
            const hours = date.getUTCHours().toString().padStart(2, '0');
            const minutes = date.getUTCMinutes().toString().padStart(2, '0');
            const secs = date.getUTCSeconds().toString().padStart(2, '0');
            const ms = date.getUTCMilliseconds().toString().padStart(3, '0');
            return `${hours}:${minutes}:${secs},${ms}`;
        };

        srtContent += `${index}\n`;
        srtContent += `${formatTime(currentStartTime)} --> ${formatTime(endTime)}\n`;
        srtContent += `${sentence.trim()}\n\n`;

        currentStartTime = endTime;
        index++;
    });

    return srtContent;
};

export const generateSimpleSRT = (text) => {
    const sentences = text.split(/(?<=[.!?])\s+/).filter((sentence) => sentence.trim().length > 0);
    let srtContent = '';
    let index = 1;
    let currentTime = 0;

    sentences.forEach((sentence) => {
        const words = sentence.trim().split(/\s+/).length;
        const duration = words * 0.3;

        const formatTime = (seconds) => {
            const date = new Date(seconds * 1000);
            const hours = date.getUTCHours().toString().padStart(2, '0');
            const minutes = date.getUTCMinutes().toString().padStart(2, '0');
            const secs = date.getUTCSeconds().toString().padStart(2, '0');
            const ms = date.getUTCMilliseconds().toString().padStart(3, '0');
            return `${hours}:${minutes}:${secs},${ms}`;
        };

        srtContent += `${index}\n`;
        srtContent += `${formatTime(currentTime)} --> ${formatTime(currentTime + duration)}\n`;
        srtContent += `${sentence.trim()}\n\n`;

        currentTime += duration;
        index++;
    });

    return srtContent;
};