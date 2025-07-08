import { useState, useEffect } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

export function useFFmpeg() {
  const [ffmpeg, setFfmpeg] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const ffmpegInstance = createFFmpeg({
          log: true,
          corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
          progress: ({ ratio }) => {
            setProgress(Math.round(ratio * 100));
          },
        });
        
        await ffmpegInstance.load();
        setFfmpeg(ffmpegInstance);
        setLoaded(true);
        console.log('FFmpeg loaded successfully');
      } catch (err) {
        console.error('Failed to load FFmpeg:', err);
        setError(err);
      }
    };
    
    loadFFmpeg();
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return { ffmpeg, loaded, error, progress };
}