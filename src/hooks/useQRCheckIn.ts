import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ATTENDANCE_ERROR_MESSAGE } from '@/constants/attendance';
import { attendanceApi } from '@/lib/apis/attendance';
import { toastError } from '@/stores/useToastStore';

interface UseQRCheckInParams {
  qrSessionId?: string;
  qrCode?: string;
}

function useQRCheckIn({ qrSessionId, qrCode }: UseQRCheckInParams) {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const hasCheckedIn = useRef(false);

  useEffect(() => {
    if (!qrSessionId || !qrCode || hasCheckedIn.current) return;
    hasCheckedIn.current = true;

    const checkIn = async () => {
      try {
        // TODO: 하드코딩된 clubId 추후 동적으로 변경
        await attendanceApi.checkIn('YUNJcjFKMO', Number(qrSessionId), Number(qrCode));
        setIsChecked(true);
        setCompleteModalOpen(true);
      } catch (error) {
        const errorCode = (error as { response?: { data?: { code?: number } } }).response?.data
          ?.code;
        toastError(errorCode ? ATTENDANCE_ERROR_MESSAGE[errorCode] : undefined);
        router.replace('/attendance');
      }
    };

    checkIn();
  }, [qrSessionId, qrCode, router]);

  function handleModalOpenChange(open: boolean) {
    setCompleteModalOpen(open);
    if (!open) router.replace('/attendance');
  }

  return { isChecked, completeModalOpen, setCompleteModalOpen: handleModalOpenChange };
}

export { useQRCheckIn };
