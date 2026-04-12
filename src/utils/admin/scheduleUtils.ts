const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

export function getDayLabel(dateString: string): string {
  const date = new Date(dateString);
  return DAY_LABELS[date.getDay()];
}

export function getDayOfMonth(dateString: string): number {
  return new Date(dateString).getDate();
}

export function formatScheduleDateTime(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours < 12 ? '오전' : '오후';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes === 0 ? '' : `:${String(minutes).padStart(2, '0')}`;

  return `${month}월 ${day}일 ${period} ${displayHours}${displayMinutes}`;
}

export function formatYearMonth(year: number, month: number): string {
  const shortYear = String(year).slice(2);
  return `${shortYear}년 ${month}월`;
}
