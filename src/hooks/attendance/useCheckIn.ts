import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProfileStatusQuery } from '@/hooks/home/useProfileStatusQuery';
import { attendanceApi } from '@/lib/apis/attendance';
import { ATTENDANCE_ERROR_MESSAGE } from '@/constants/attendance';
import { useClubId } from '@/stores/useClubStore';
import { toastError } from '@/stores/useToastStore';
import { useAttendanceQuery } from '@/hooks/attendance/useAttendanceQuery';

export function useCheckIn() {
  const queryClient = useQueryClient();
  const clubId = useClubId();
  const { data } = useAttendanceQuery();
  const { data: profileStatus, isLoading: isProfileLoading } = useProfileStatusQuery();
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [cardinalModalOpen, setCardinalModalOpen] = useState(false);
  const [checkedSessionId, setCheckedSessionId] = useState<number | null>(null);
  const [checkInError, setCheckInError] = useState(false);

  const isChecked = data?.status === 'ATTEND' || checkedSessionId === data?.sessionId;

  async function handleCheckIn(code: string) {
    if (!isProfileLoading && profileStatus?.cardinalAssigned === false) {
      setCardinalModalOpen(true);
      return;
    }
    if (!clubId || !data?.sessionId) return;

    try {
      setCheckInError(false);
      await attendanceApi.checkIn(clubId, data.sessionId, Number(code));
    } catch (error) {
      const errorCode = (error as { response?: { data?: { code?: number } } }).response?.data?.code;
      if (errorCode && ATTENDANCE_ERROR_MESSAGE[errorCode]) {
        toastError(ATTENDANCE_ERROR_MESSAGE[errorCode]);
      } else {
        setCheckInError(true);
      }
      return;
    }

    setCheckedSessionId(data.sessionId);
    queryClient.invalidateQueries({ queryKey: ['attendance', clubId] });
  }

  return {
    isChecked,
    checkInError,
    codeModalOpen,
    setCodeModalOpen,
    cardinalModalOpen,
    setCardinalModalOpen,
    handleCheckIn,
  };
}
