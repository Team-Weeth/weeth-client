const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
const INVALID_DATE_FALLBACK = '-';

function parseDate(dateString: string): Date | null {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getDayLabel(dateString: string): string {
  const date = parseDate(dateString);
  return date ? DAY_LABELS[date.getDay()] : INVALID_DATE_FALLBACK;
}

export function getDayOfMonth(dateString: string): number | null {
  const date = parseDate(dateString);
  return date ? date.getDate() : null;
}

export function formatScheduleDateTime(dateString: string): string {
  const date = parseDate(dateString);
  if (!date) return INVALID_DATE_FALLBACK;

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours < 12 ? '오전' : '오후';
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');

  return `${month}월 ${day}일 ${period} ${displayHours}:${displayMinutes}`;
}

export function formatYearMonth(year: number, month: number): string {
  const shortYear = String(year).slice(2);
  return `${shortYear}년 ${month}월`;
}
