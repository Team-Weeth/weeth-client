'use client';

import { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { cn } from '@/lib/cn';

interface CameraViewportProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onError'> {
  /** 부모에서 Webcam 인스턴스에 접근이 필요할 때 전달 (QR 스캐너 등) */
  webcamRef?: React.RefObject<Webcam | null>;
  /** 카메라가 준비되면 실제 비디오 해상도를 전달 */
  onReady?: (videoWidth: number, videoHeight: number) => void;
  onError?: (message: string) => void;
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * 후면 카메라 뷰포트 컴포넌트
 *
 * Webcam 렌더링, 준비 중 오버레이, 에러 표시를 담당.
 * children은 카메라가 준비된 이후에만 렌더링되므로
 * QR 코너 하이라이트 등 카메라 위에 얹는 오버레이에 사용한다.
 */
function CameraViewport({
  className,
  ref,
  webcamRef,
  onReady,
  onError,
  children,
  ...props
}: CameraViewportProps) {
  const internalWebcamRef = useRef<Webcam | null>(null);
  const resolvedWebcamRef = webcamRef ?? internalWebcamRef;
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div
      ref={ref}
      className={cn(
        'bg-container-neutral-alternative relative aspect-3/4 w-full max-w-70 overflow-hidden rounded-md',
        className,
      )}
      {...props}
    >
      {error ? (
        <div className="flex h-full w-full items-center justify-center p-400 text-center">
          <p className="typo-body2 text-state-error">{error}</p>
        </div>
      ) : (
        <>
          <Webcam
            ref={(instance) => {
              (resolvedWebcamRef as React.MutableRefObject<Webcam | null>).current = instance;
            }}
            audio={false}
            videoConstraints={{ facingMode: { ideal: 'environment' } }}
            onUserMedia={() => {
              const video = resolvedWebcamRef.current?.video;
              setIsReady(true);
              onReady?.(video?.videoWidth ?? 1, video?.videoHeight ?? 1);
            }}
            onUserMediaError={(err) => {
              const message =
                typeof err === 'string' ? err : err.message || '카메라에 접근할 수 없습니다.';
              setError(message);
              onError?.(message);
            }}
            className="h-full w-full object-cover"
          />
          {isReady && children}
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="typo-caption2 text-text-alternative">카메라를 준비 중이에요...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export { CameraViewport, type CameraViewportProps };
