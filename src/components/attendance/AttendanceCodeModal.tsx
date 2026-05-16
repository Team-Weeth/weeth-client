'use client';

import { useEffect, useRef, useState } from 'react';
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
  const webcamRef = useRef<Webcam>(null);
  const hasShownRef = useRef(false);

  const { status, expiredAt: sseExpiredAt } = useAttendanceSSE({ enabled: open });
  const isLoading = status === null;
  const { minutes, seconds, isExpired } = useRemainingTime(sseExpiredAt ?? '');
  const isComplete = code.length === 6;
  const description = formatModalDescription(start, location);

  function stopCamera() {
    setScanning(false);
    setCameraReady(false);
    setCameraError(null);
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
    onScan: (data) => {
      const digits = parseAttendanceQRCode(data);
      if (digits.length !== 6) return;

      onConfirm?.(digits);
      handleOpenChange(false);
      return true;
    },
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
            <div className="bg-container-neutral-alternative relative aspect-3/4 w-full max-w-70 overflow-hidden rounded-md">
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
                    onUserMedia={() => setCameraReady(true)}
                    onUserMediaError={(err) => {
                      const message = typeof err === 'string' ? err : err.message;
                      setCameraError(message || '카메라에 접근할 수 없습니다.');
                    }}
                    className="h-full w-full object-cover"
                  />
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
