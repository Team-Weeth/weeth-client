import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ATTENDANCE_ERROR_MESSAGE } from '@/constants/attendance';
import { attendanceApi } from '@/lib/apis/attendance';
import { useClubId } from '@/stores/useClubStore';
import { toastError } from '@/stores/useToastStore';

interface UseQRCheckInParams {
  qrSessionId?: string;
  qrCode?: string;
}

function useQRCheckIn({ qrSessionId, qrCode }: UseQRCheckInParams) {
  const router = useRouter();
  const clubId = useClubId();
  const [isChecked, setIsChecked] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const hasCheckedIn = useRef(false);

  useEffect(() => {
    if (!clubId || !qrSessionId || !qrCode || hasCheckedIn.current) return;
    hasCheckedIn.current = true;

    const checkIn = async () => {
      try {
        await attendanceApi.checkIn(clubId, Number(qrSessionId), Number(qrCode));
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
  }, [clubId, qrSessionId, qrCode, router]);

  function handleModalOpenChange(open: boolean) {
    setCompleteModalOpen(open);
    if (!open) router.replace('/attendance');
  }

  return { isChecked, completeModalOpen, setCompleteModalOpen: handleModalOpenChange };
}

export { useQRCheckIn };
