'use client';

import { useEffect, useRef, useState } from 'react';
import type { QRCode } from 'jsqr';
import Webcam from 'react-webcam';

import { CameraIcon, CheckRoundIcon } from '@/assets/icons';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Icon,
} from '@/components/ui';
import { InputOTP } from '@/components/attendance/InputOTP';
import { useAttendanceSSE, useQRScanner } from '@/hooks/attendance';
import { useRemainingTime } from '@/hooks';
import { toastError } from '@/stores/useToastStore';
import { formatModalDescription } from '@/lib/formatTime';
import { parseAttendanceQRCode } from '@/utils/attendance/parseAttendanceQRCode';

interface AttendanceCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (code: string) => void;
  title: string;
  start: string;
  location: string;
}

interface VideoSize {
  width: number;
  height: number;
}

interface ViewportSize {
  width: number;
  height: number;
}

function AttendanceCodeModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  start,
  location,
}: AttendanceCodeModalProps) {
  const [code, setCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<QRCode['location'] | null>(null);
  const [videoSize, setVideoSize] = useState<VideoSize>({ width: 1, height: 1 });
  const [viewportSize, setViewportSize] = useState<ViewportSize>({ width: 1, height: 1 });
  const webcamRef = useRef<Webcam>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const hasShownRef = useRef(false);
  const confirmTimeoutRef = useRef<number | null>(null);

  const { status, expiredAt: sseExpiredAt } = useAttendanceSSE();
  const isLoading = status === null;
  const { minutes, seconds, isExpired } = useRemainingTime(sseExpiredAt ?? '');
  const isComplete = code.length === 6;
  const description = formatModalDescription(start, location);

  function stopCamera() {
    if (confirmTimeoutRef.current != null) {
      window.clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = null;
    }
    setScanning(false);
    setCameraReady(false);
    setCameraError(null);
    setDetectedLocation(null);
    setVideoSize({ width: 1, height: 1 });
    setViewportSize({ width: 1, height: 1 });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setCode('');
      stopCamera();
    }
    onOpenChange(nextOpen);
  }

  useQRScanner({
    enabled: scanning,
    getVideo: () => webcamRef.current?.video ?? null,
    onScan: ({ data, location, videoWidth, videoHeight }) => {
      const digits = parseAttendanceQRCode(data);
      if (digits.length !== 6) return;

      setVideoSize({ width: videoWidth, height: videoHeight });
      setDetectedLocation(location);
      // TODO: 코너선 디버깅용 - 위치 확인 후 아래 timeout/return 복원
      // confirmTimeoutRef.current = window.setTimeout(() => {
      //   onConfirm?.(digits);
      //   handleOpenChange(false);
      // }, 700);
      // return true;
    },
    onLost: () => setDetectedLocation(null),
  });

  useEffect(() => {
    if (!open || status === null) return;

    if ((status === 'qr-none' || status === 'qr-close') && !hasShownRef.current) {
      hasShownRef.current = true;
      toastError('현재 출석이 진행 중이 아닙니다.');
      onOpenChange(false);
    }
  }, [open, status, onOpenChange]);

  useEffect(() => {
    if (!open) hasShownRef.current = false;
  }, [open]);

  useEffect(
    () => () => {
      if (confirmTimeoutRef.current != null) {
        window.clearTimeout(confirmTimeoutRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const updateViewportSize = () => {
      setViewportSize({
        width: element.clientWidth || 1,
        height: element.clientHeight || 1,
      });
    };

    updateViewportSize();

    const observer = new ResizeObserver(updateViewportSize);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [scanning]);

  function getCornerSegments() {
    if (!detectedLocation) return [];

    const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = detectedLocation;
    const cornerLength = 12;
    const scale = Math.max(
      viewportSize.width / videoSize.width,
      viewportSize.height / videoSize.height,
    );
    const offsetX = (viewportSize.width - videoSize.width * scale) / 2;
    const offsetY = (viewportSize.height - videoSize.height * scale) / 2;

    const mapPoint = ({ x, y }: { x: number; y: number }) => ({
      x: x * scale + offsetX,
      y: y * scale + offsetY,
    });

    const topLeft = mapPoint(topLeftCorner);
    const topRight = mapPoint(topRightCorner);
    const bottomRight = mapPoint(bottomRightCorner);
    const bottomLeft = mapPoint(bottomLeftCorner);

    return [
      `M ${topLeft.x + cornerLength} ${topLeft.y} L ${topLeft.x} ${topLeft.y} L ${topLeft.x} ${topLeft.y + cornerLength}`,
      `M ${topRight.x - cornerLength} ${topRight.y} L ${topRight.x} ${topRight.y} L ${topRight.x} ${topRight.y + cornerLength}`,
      `M ${bottomRight.x - cornerLength} ${bottomRight.y} L ${bottomRight.x} ${bottomRight.y} L ${bottomRight.x} ${bottomRight.y - cornerLength}`,
      `M ${bottomLeft.x + cornerLength} ${bottomLeft.y} L ${bottomLeft.x} ${bottomLeft.y} L ${bottomLeft.x} ${bottomLeft.y - cornerLength}`,
    ];
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-background flex h-[565px] w-full max-w-[508px] min-w-[320px] flex-col"
      >
        <DialogHeader
          icon={<Icon src={CheckRoundIcon} size={24} className="text-icon-alternative" />}
          overline="QR 출석하기"
          title={title}
          description={description}
          showClose
          onClose={() => handleOpenChange(false)}
        />

        <DialogBody className="flex-1 items-center justify-start gap-300 self-stretch p-400">
          {scanning ? (
            <div
              ref={viewportRef}
              className="bg-container-neutral-alternative relative aspect-3/4 w-full max-w-70 overflow-hidden rounded-md"
            >
              {cameraError ? (
                <div className="flex h-full w-full items-center justify-center p-400 text-center">
                  <p className="typo-body2 text-state-error">{cameraError}</p>
                </div>
              ) : (
                <>
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    videoConstraints={{ facingMode: { ideal: 'environment' } }}
                    onUserMedia={() => {
                      const video = webcamRef.current?.video;
                      setVideoSize({
                        width: video?.videoWidth || 1,
                        height: video?.videoHeight || 1,
                      });
                      setCameraReady(true);
                    }}
                    onUserMediaError={(err) => {
                      const message = typeof err === 'string' ? err : err.message;
                      setCameraError(message || '카메라에 접근할 수 없습니다.');
                    }}
                    className="h-full w-full object-cover"
                  />
                  {cameraReady && detectedLocation && (
                    <svg
                      className="pointer-events-none absolute inset-0 h-full w-full"
                      viewBox={`0 0 ${viewportSize.width} ${viewportSize.height}`}
                      preserveAspectRatio="none"
                    >
                      {getCornerSegments().map((segment, idx) => (
                        <path
                          key={idx}
                          d={segment}
                          fill="none"
                          stroke="#FFD60A"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      ))}
                    </svg>
                  )}
                  {!cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="typo-caption2 text-text-alternative">
                        카메라를 준비 중이에요...
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <>
              <div className="bg-container-neutral-alternative flex items-start gap-2.5 self-stretch rounded-md p-300">
                <div className="flex flex-1 flex-col gap-100 text-center">
                  <p className="typo-caption1 text-text-strong">
                    운영진이 공유한 6자리 출석 코드를 입력하세요
                  </p>
                  <p className="typo-caption2 text-text-alternative">
                    QR 스캔이 어려운 경우 코드를 직접 입력할 수 있어요
                  </p>
                </div>
              </div>

              <InputOTP value={code} onChange={setCode} />

              {isLoading ? (
                <p className="typo-caption2 text-text-alternative text-center">
                  출석 정보를 불러오는 중...
                </p>
              ) : !isExpired ? (
                <p className="typo-caption2 text-text-strong text-center">
                  출석 가능 시간{' '}
                  <span className="text-brand-primary tabular-nums">
                    {minutes}:{seconds}
                  </span>
                </p>
              ) : (
                <p className="typo-caption2 text-state-error text-center">
                  출석 가능 시간이 만료되었습니다
                </p>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => (scanning ? stopCamera() : setScanning(true))}
            className="bg-button-neutral hover:bg-button-neutral-interaction flex cursor-pointer items-center justify-center gap-100 rounded-sm px-300 py-200"
          >
            <Icon src={CameraIcon} size={16} className="text-icon-normal" />
            <span className="typo-button2 text-text-normal">
              {scanning ? '스캔 취소' : 'QR코드 스캔하기'}
            </span>
          </button>
        </DialogBody>

        <DialogFooter
          description="모바일에서는 QR코드를 카메라로 스캔할 수 있어요."
          showDivider
          className="self-stretch"
        >
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!isComplete}
            onClick={() => {
              onConfirm?.(code);
              handleOpenChange(false);
            }}
          >
            출석 확인하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { AttendanceCodeModal, type AttendanceCodeModalProps };
