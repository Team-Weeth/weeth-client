'use client';

import { useEffect, useRef } from 'react';
import jsQR from 'jsqr';

interface UseQRScannerOptions {
  enabled: boolean;
  getVideo: () => HTMLVideoElement | null;
  onScan: (data: string) => boolean | void;
  scanIntervalMs?: number;
}

function useQRScanner({ enabled, getVideo, onScan, scanIntervalMs = 250 }: UseQRScannerOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stoppedRef = useRef(false);
  const onScanRef = useRef(onScan);
  const getVideoRef = useRef(getVideo);

  useEffect(() => {
    onScanRef.current = onScan;
    getVideoRef.current = getVideo;
  });

  useEffect(() => {
    if (!enabled) {
      stoppedRef.current = false;
      return;
    }

    const intervalId = window.setInterval(() => {
      if (stoppedRef.current) return;

      const video = getVideoRef.current();
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) return;

      const width = video.videoWidth;
      const height = video.videoHeight;
      if (!width || !height) return;

      const canvas = canvasRef.current ?? document.createElement('canvas');
      canvasRef.current = canvas;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const result = jsQR(imageData.data, width, height, {
        inversionAttempts: 'dontInvert',
      });

      if (result?.data) {
        const shouldStop = onScanRef.current(result.data);
        if (shouldStop === true) {
          stoppedRef.current = true;
        }
      }
    }, scanIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, scanIntervalMs]);
}

export { useQRScanner, type UseQRScannerOptions };
