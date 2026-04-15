export const DAY_META = [
  { ko: '일', en: 'SUN' },
  { ko: '월', en: 'MON' },
  { ko: '화', en: 'TUE' },
  { ko: '수', en: 'WED' },
  { ko: '목', en: 'THU' },
  { ko: '금', en: 'FRI' },
  { ko: '토', en: 'SAT' },
] as const;

export const HOURS = Array.from({ length: 24 }, (_, i) => i);
export const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
