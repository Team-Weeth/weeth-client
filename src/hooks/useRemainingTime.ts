'use client';

import { useState, useEffect } from 'react';

/**
 * 종료 시각까지 남은 시간을 1초 간격으로 카운트다운하는 훅
 *
 * @param endTime - ISO 8601 형식의 종료 시각 문자열
 * @returns minutes - 남은 분 (2자리, 예: "05")
 * @returns seconds - 남은 초 (2자리, 예: "09")
 * @returns isExpired - 시간 만료 여부
 */
function getRemainingSeconds(endTime: string) {
  const end = new Date(endTime).getTime();
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.floor((end - Date.now()) / 1000));
}

function useRemainingTime(endTime: string) {
  const [remaining, setRemaining] = useState(() => getRemainingSeconds(endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = getRemainingSeconds(endTime);
      setRemaining(seconds);
      if (seconds <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  return { minutes, seconds, isExpired: remaining <= 0 };
}

export { useRemainingTime };
