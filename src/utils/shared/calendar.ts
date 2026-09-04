import { getDaysInMonth, getFirstDayOfMonth } from '@/utils/shared/date';

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
