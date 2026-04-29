import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProfileStatusQuery } from '@/hooks/home/useProfileStatusQuery';
import { attendanceApi } from '@/lib/apis/attendance';
import { ATTENDANCE_ERROR_MESSAGE } from '@/constants/attendance';
import { useClubId } from '@/stores/useClubStore';
import { toastError } from '@/stores/useToastStore';
import { useAttendanceQuery } from '@/hooks/attendance/useAttendanceQuery';
// TODO: SSE 연결 안정화 후 복원
// import { useAttendanceSSE } from '@/hooks/attendance/useAttendanceSSE';

interface UseCheckInOptions {
  sessionId?: number | null;
  onSuccess?: () => void;
}

export function useCheckIn(options?: UseCheckInOptions) {
  const queryClient = useQueryClient();
  const clubId = useClubId();
  const { data } = useAttendanceQuery();
  const { data: profileStatus, isLoading: isProfileLoading } = useProfileStatusQuery();
  // TODO: SSE 연결 안정화 후 복원
  // const { status: qrStatus } = useAttendanceSSE();
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [cardinalModalOpen, setCardinalModalOpen] = useState(false);
  const [checkedSessionId, setCheckedSessionId] = useState<number | null>(null);
  const [checkInError, setCheckInError] = useState(false);

  function openCodeModal() {
    // TODO: SSE 연결 안정화 후 복원
    // if (qrStatus === 'qr-none') {
    //   toastError('아직 출석 코드가 생성되지 않았습니다.');
    //   return;
    // }
    // if (qrStatus === 'qr-close') {
    //   toastError('QR 코드가 만료되었거나 존재하지 않습니다.');
    //   return;
    // }
    setCodeModalOpen(true);
  }

  const sessionId = options?.sessionId ?? data?.sessionId;
  const isChecked =
    data?.status === 'ATTEND' || (sessionId != null && checkedSessionId === sessionId);

  async function handleCheckIn(code: string) {
    if (!isProfileLoading && profileStatus?.cardinalAssigned === false) {
      setCardinalModalOpen(true);
      return;
    }
    if (!clubId || !sessionId) return;

    try {
      setCheckInError(false);
      await attendanceApi.checkIn(clubId, sessionId, Number(code));
    } catch (error) {
      const errorCode = (error as { response?: { data?: { code?: number } } }).response?.data?.code;
      if (errorCode && ATTENDANCE_ERROR_MESSAGE[errorCode]) {
        toastError(ATTENDANCE_ERROR_MESSAGE[errorCode]);
      } else {
        toastError();
        setCheckInError(true);
      }
      return;
    }

    setCheckedSessionId(sessionId);
    setCodeModalOpen(false);
    options?.onSuccess?.();
    queryClient.invalidateQueries({ queryKey: ['attendance', clubId] });
  }

  return {
    isChecked,
    checkInError,
    // TODO: SSE 연결 안정화 후 복원
    // qrStatus,
    codeModalOpen,
    setCodeModalOpen,
    openCodeModal,
    cardinalModalOpen,
    setCardinalModalOpen,
    handleCheckIn,
  };
}
