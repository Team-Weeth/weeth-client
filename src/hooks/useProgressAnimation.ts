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

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 2.5);
    }

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const t = Math.min((timestamp - startTime) / duration, 1);
      setProgress(easeOut(t) * TARGET);
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
