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
function useRemainingTime(endTime: string) {
  // 초 단위 남은 시간 (초기값은 함수형 초기화로 한 번만 계산)
  const [remaining, setRemaining] = useState(() => {
    const diff = new Date(endTime).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  });

  // 1초마다 남은 시간 갱신, 만료 시 인터벌 자동 정리
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(endTime).getTime() - Date.now();
      const seconds = Math.max(0, Math.floor(diff / 1000));
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
