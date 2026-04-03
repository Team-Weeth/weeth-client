'use client';

import Lottie from 'lottie-react';

import { cn } from '@/lib/cn';
import loadingData from '@/assets/lotties/loading.json';

type LottieLayer = {
  shapes?: Array<{
    it?: Array<{
      ty: string;
      c?: { a: number; k: number[] };
    }>;
  }>;
};

type LottieData = typeof loadingData & { layers: LottieLayer[] };

function hexToLottieColor(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '').trim();
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
}

function Loading({ className }: LoadingProps) {
  let animationData = loadingData as LottieData;

  if (typeof document !== 'undefined') {
    const hex = getComputedStyle(document.documentElement).getPropertyValue('--icon-normal').trim();
    if (hex) {
      animationData = applyColor(loadingData as LottieData, hexToLottieColor(hex));
    }
  }

  return (
    <Lottie animationData={animationData} loop autoplay className={cn('size-20', className)} />
  );
}

export { Loading, type LoadingProps };
