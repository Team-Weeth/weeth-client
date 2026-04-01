import { useEffect, useState } from 'react';

interface UseProgressAnimationOptions {
  duration: number;
  onComplete?: () => void;
}

function useProgressAnimation({ duration, onComplete }: UseProgressAnimationOptions) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const TARGET = 100;
    let startTime: number | null = null;
    let rafId: number;

    // Slow at the beginning and end, faster through the middle.
    function easeInOut(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const t = Math.min((timestamp - startTime) / duration, 1);
      setProgress(easeInOut(t) * TARGET);
      if (t < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [duration, onComplete]);

  return progress;
}

export { useProgressAnimation };
