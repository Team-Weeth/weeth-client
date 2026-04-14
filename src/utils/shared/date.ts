import { DAY_NAMES } from '@/constants/shared/date';

// '2026-03-09' (HTML <input type="date"> value 포맷)
export function toDateInputValue(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// '2026년 3월 9일 (월)'
export function formatKoreanDate(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = DAY_NAMES[date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
}

// '3월 9일 (월) 14:00 ~ 3월 9일 (월) 16:00'
export function formatKoreanTimeRange(start: string, end: string): string {
  const toLabel = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = DAY_NAMES[date.getDay()];
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
