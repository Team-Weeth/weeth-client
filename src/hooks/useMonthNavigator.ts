'use client';

import { useState } from 'react';

function useMonthNavigator(initialYear?: number, initialMonth?: number) {
  const [year, setYear] = useState(() => initialYear ?? new Date().getFullYear());
  const [month, setMonth] = useState(() => initialMonth ?? new Date().getMonth() + 1);

  const prev = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const next = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
  };

  return { year, month, prev, next, goToToday };
}

export { useMonthNavigator };
