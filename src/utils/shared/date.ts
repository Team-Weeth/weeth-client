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

export function formatCompactDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;

  return `${year}.${month.padStart(2, '0')}.${day.padStart(2, '0')}`;
}

export function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h < 12 ? '오전' : '오후';
  const displayHour = h % 12 || 12;
  return `${period} ${displayHour}:${String(m).padStart(2, '0')}`;
}

export function formatSessionDateParts(start: string): {
  day: string;
  weekday: string;
  timeLabel: string;
} {
  const date = new Date(start);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours < 12 ? '오전' : '오후';
  const displayHour = hours % 12 || 12;

  return {
    day: String(day),
    weekday: DAY_META[date.getDay()].en.toUpperCase(),
    timeLabel: `${month}월 ${day}일 ${period} ${displayHour}:${minutes}`,
  };
}

// ─── Calendar cell utilities ───────────────────────────────────────────────

export type CalendarCell = {
  day: number;
  year: number;
  month: number;
  dateStr: string; // 'YYYY-MM-DD'
  dayOfWeek: number; // 0=Sun, 6=Sat
  isCurrentMonth: boolean;
  isToday: boolean;
};

export function buildCalendarCells(year: number, month: number): CalendarCell[] {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month === 1 ? 12 : month - 1);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const toDateStr = (y: number, m: number, d: number) =>
    `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return Array.from({ length: totalCells }, (_, i) => {
    const dayOfWeek = i % 7;
    if (i < firstDay) {
      const day = prevMonthDays - (firstDay - 1 - i);
      const m = month === 1 ? 12 : month - 1;
      const y = month === 1 ? year - 1 : year;
      return {
        day,
        year: y,
        month: m,
        dateStr: toDateStr(y, m, day),
        dayOfWeek,
        isCurrentMonth: false,
        isToday: false,
      };
    } else if (i < firstDay + daysInMonth) {
      const day = i - firstDay + 1;
      return {
        day,
        year,
        month,
        dateStr: toDateStr(year, month, day),
        dayOfWeek,
        isCurrentMonth: true,
        isToday: year === todayYear && month === todayMonth && day === todayDay,
      };
    } else {
      const day = i - firstDay - daysInMonth + 1;
      const m = month === 12 ? 1 : month + 1;
      const y = month === 12 ? year + 1 : year;
      return {
        day,
        year: y,
        month: m,
        dateStr: toDateStr(y, m, day),
        dayOfWeek,
        isCurrentMonth: false,
        isToday: false,
      };
    }
  });
}

export function getCalendarCellColors(
  isCurrentMonth: boolean,
  isSelected: boolean,
  isTodayHighlighted: boolean,
  dayOfWeek: number,
): { bg: string; text: string } {
  const bg = isSelected ? 'bg-brand-primary' : isTodayHighlighted ? 'bg-container-primary' : '';
  let text: string;
  if (!isCurrentMonth) text = 'text-text-disabled';
  else if (isSelected || isTodayHighlighted) text = 'text-text-inverse';
  else if (dayOfWeek === 0) text = 'text-state-error';
  else if (dayOfWeek === 6) text = 'text-state-success';
  else text = 'text-text-normal';
  return { bg, text };
}

// 'YYYY-MM' → 'N월'
export function toMonthLabel(yearMonth: string): string {
  return `${Number(yearMonth.split('-')[1])}월`;
}

// 'YYYY-MM' → 'YYYY.MM.'
export function toPeriodLabel(yearMonth: string | undefined): string {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  return `${year}.${month}.`;
}
