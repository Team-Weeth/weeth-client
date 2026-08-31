'use client';

import dynamic from 'next/dynamic';

import { cn } from '@/lib/cn';
import loadingData from '@/assets/lotties/loading.json';

const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => <div className="size-20" aria-hidden />,
});

type LottieLayer = {
  shapes?: Array<{
    it?: Array<{
      ty: string;
      c?: { a: number; k: number[] };
    }>;
  }>;
};

type LottieData = typeof loadingData & { layers: LottieLayer[] };

function hexToLottieColor(hex: string): [number, number, number] | null {
  const cleaned = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  const r = parseInt(cleaned.slice(0, 2), 16) / 255;
  const g = parseInt(cleaned.slice(2, 4), 16) / 255;
  const b = parseInt(cleaned.slice(4, 6), 16) / 255;
  return [r, g, b];
}

function applyColor(data: LottieData, color: [number, number, number]): LottieData {
  const cloned: LottieData = JSON.parse(JSON.stringify(data));
  cloned.layers.forEach((layer) => {
    layer.shapes?.forEach((shape) => {
      shape.it?.forEach((item) => {
        if (item.ty === 'st' && item.c) {
          item.c.k = color;
        }
      });
    });
  });
  return cloned;
}

interface LoadingProps {
  className?: string;
  colorHex?: string;
}

function Loading({ className, colorHex }: LoadingProps) {
  let animationData = loadingData as LottieData;

  if (typeof document !== 'undefined') {
    const hex =
      colorHex ||
      getComputedStyle(document.documentElement).getPropertyValue('--icon-normal').trim();
    const color = hexToLottieColor(hex);
    if (color) {
      animationData = applyColor(loadingData as LottieData, color);
    }
  }

  return (
    <Lottie animationData={animationData} loop autoplay className={cn('size-20', className)} />
  );
}

export { Loading, type LoadingProps };
