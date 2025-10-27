import { useRef, useEffect, useCallback, useState } from 'react';
import { applySafariVideoFixes, waitForSafariVideoReady } from '@/src/utils/safari-compatibility';

export interface VideoStreamHook {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  setupVideo: (stream: MediaStream) => Promise<void>;
  cleanupVideo: () => void;
  isVideoReady: boolean;
}

/**
 * Hook for managing video stream and video element
 * Handles Safari-specific video setup and monitoring
 */
export function useVideoStream(): VideoStreamHook {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const setupVideo = useCallback(async (stream: MediaStream): Promise<void> => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    
    // Apply Safari fixes
    applySafariVideoFixes(video);
    video.srcObject = stream;
    
    // Set video attributes
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    
    // Force set video styles
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.style.backgroundColor = '#000';
    
    try {
      await video.play();
      console.log('Video playback started');
    } catch (playError) {
      console.warn('Video play failed, but continuing:', playError);
    }
    
    // Wait for video to be ready (non-blocking)
    try {
      await waitForSafariVideoReady(video);
      console.log('Video is ready');
      setIsVideoReady(true);
    } catch (readyError) {
      console.warn('Video ready check failed, but continuing:', readyError);
      setIsVideoReady(true); // Assume ready anyway
    }
  }, []);

  const cleanupVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      setIsVideoReady(false);
    }
  }, []);

  // Monitor video stream and ensure it keeps playing
  useEffect(() => {
    if (videoRef.current && isVideoReady) {
      const video = videoRef.current;
      
      const checkVideoPlayback = () => {
        if (video && video.paused && !video.ended) {
          console.log('Video is paused, attempting to restart');
          video.play().catch(console.warn);
        }
      };
      
      // Regular check for video playback
      const interval = setInterval(checkVideoPlayback, 1000);
      
      // Listen for video events
      const handleVideoError = () => {
        console.log('Video error detected, attempting to restart');
        setTimeout(() => {
          if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.play().catch(console.warn);
          }
        }, 500);
      };
      
      video.addEventListener('error', handleVideoError);
      video.addEventListener('pause', checkVideoPlayback);
      
      return () => {
        clearInterval(interval);
        video.removeEventListener('error', handleVideoError);
        video.removeEventListener('pause', checkVideoPlayback);
      };
    }
  }, [isVideoReady]);

  return {
    videoRef,
    setupVideo,
    cleanupVideo,
    isVideoReady,
  };
}
