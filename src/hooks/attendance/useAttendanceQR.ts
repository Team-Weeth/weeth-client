import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

import { useQRCode } from '@/hooks/attendance/useQRCode';

function useAttendanceQR(clubId: string | null, sessionId: number) {
  const { data: qrData, isLoading } = useQRCode(clubId, sessionId);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!qrData || !qrRef.current) return;

    const checkInUrl = `${window.location.origin}/${clubId}/attendance?sessionId=${qrData.sessionId}&code=${qrData.code}`;

    if (!qrCodeRef.current) {
      const dotColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--icon-strong')
        .trim();

      qrCodeRef.current = new QRCodeStyling({
        width: 256,
        height: 256,
        data: checkInUrl,
        qrOptions: { errorCorrectionLevel: 'L' },
        type: 'svg',
        dotsOptions: { type: 'dots', color: dotColor },
        cornersSquareOptions: { type: 'extra-rounded', color: dotColor },
        cornersDotOptions: { type: 'extra-rounded', color: dotColor },
        backgroundOptions: { color: 'transparent' },
      });
      qrCodeRef.current.append(qrRef.current);
    } else {
      qrCodeRef.current.update({ data: checkInUrl });
    }
  }, [qrData]);

  return { qrRef, qrData, isLoading };
}

export { useAttendanceQR };
