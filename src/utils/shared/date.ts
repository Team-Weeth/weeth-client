import { DAY_META } from '@/constants/shared/date';

// '2026-03-09' (HTML <input type="date"> value 포맷)
export function toDateInputValue(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 'YYYY-MM-DD' 문자열에 지정한 연수를 더한 날짜를 같은 포맷으로 반환
// 윤년 2월 29일 + N년처럼 대상 월에 존재하지 않는 날짜는 해당 월의 마지막 날로 clamp한다
// (Date 생성자의 overflow 정규화로 다음 달로 밀리는 것 방지).
export function addYearsToDateInput(dateStr: string, years: number): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const targetYear = y + years;
  const targetMonthIndex = m - 1;
  // 대상 월의 다음 달 0일 = 대상 월의 마지막 날
  const lastDayOfTargetMonth = new Date(targetYear, targetMonthIndex + 1, 0).getDate();
  const clampedDay = Math.min(d, lastDayOfTargetMonth);
  return toDateInputValue(new Date(targetYear, targetMonthIndex, clampedDay));
}

// '2026년 3월 9일 (월)'
export function formatKoreanDate(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = DAY_META[date.getDay()].ko;
  return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
}

// '3월 9일 (월) 14:00 ~ 3월 9일 (월) 16:00'
export function formatKoreanTimeRange(start: string, end: string): string {
  const toLabel = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = DAY_META[date.getDay()].ko;
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}월 ${day}일 (${dayOfWeek}) ${hours}:${minutes}`;
  };
  return `${toLabel(new Date(start))} ~ ${toLabel(new Date(end))}`;
}

// '3월 29일 (19:00 ~ 20:30)'
export function formatDateWithTimeRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const month = startDate.getMonth() + 1;
  const day = startDate.getDate();
  const startTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
  const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
  return `${month}월 ${day}일 (${startTime} ~ ${endTime})`;
}

// [['2026-03-09', [{id:1,...}, {id:2,...}]], ['2026-03-10', [{id:3,...}]]]
export function groupByStartDate<T extends { start: string }>(items: T[]): [string, T[]][] {
  const groupedByDate = new Map<string, T[]>();
  for (const item of items) {
    const dateKey = item.start.split('T')[0];
    if (!groupedByDate.has(dateKey)) groupedByDate.set(dateKey, []);
    groupedByDate.get(dateKey)!.push(item);
  }
  return Array.from(groupedByDate.entries());
}

// '2026. 7. 20(목) 14:00'
export function formatLastUpdated(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = DAY_META[date.getDay()].ko;
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}. ${month}. ${day}(${dayOfWeek}) ${hours}:${minutes}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${year}. ${month}. ${day}`;
}

export function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h < 12 ? '오전' : '오후';
  const displayHour = h % 12 || 12;
  return `${period} ${displayHour}:${String(m).padStart(2, '0')}`;
}
