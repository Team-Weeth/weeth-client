import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ATTENDANCE_ERROR_MESSAGE } from '@/constants/attendance';
import { attendanceApi } from '@/lib/apis/attendance';
import { useClubId } from '@/stores/useClubStore';
import { toastError } from '@/stores/useToastStore';

interface UseQRCheckInParams {
  qrSessionId?: string;
  qrCode?: string;
  onSuccess?: () => void;
}

function useQRCheckIn({ qrSessionId, qrCode, onSuccess }: UseQRCheckInParams) {
  const router = useRouter();
  const clubId = useClubId();
  const [isChecked, setIsChecked] = useState(false);
  const checkedKey = useRef<string | null>(null);

  useEffect(() => {
    if (!clubId || !qrSessionId || !qrCode) return;

    const key = `${qrSessionId}:${qrCode}`;
    if (checkedKey.current === key) return;

    const checkIn = async () => {
      try {
        await attendanceApi.checkIn(clubId, Number(qrSessionId), Number(qrCode));
        checkedKey.current = key;
        setIsChecked(true);
        onSuccess?.();
      } catch (error) {
        const errorCode = (error as { response?: { data?: { code?: number } } }).response?.data
          ?.code;
        toastError(errorCode ? ATTENDANCE_ERROR_MESSAGE[errorCode] : undefined);
        router.replace('/attendance');
      }
    };

    checkIn();
  }, [clubId, qrSessionId, qrCode, router, onSuccess]);

  return { isChecked };
}

export { useQRCheckIn };
