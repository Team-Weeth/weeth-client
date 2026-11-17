import type { AdminSessionGroup } from '@/types/admin/session';

function formatShortDate(dateStr: string): string {
  return dateStr.slice(2).replace(/-/g, '.');
}

function formatGroupDateRange(start: string, end: string | null): string {
  const shortStart = formatShortDate(start);
  if (!end) return shortStart;
  const [, m, d] = end.split('-');
  return `${shortStart} ~ ${m}.${d}`;
}

function extractTime(isoStr: string): string {
  return isoStr.slice(11, 16);
}

function formatTimeRange(start: string, end: string): string {
  return `${extractTime(start)} - ${extractTime(end)}`;
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

function formatSessionDate(isoStr: string): string {
  const datePart = isoStr.slice(0, 10);
  const short = formatShortDate(datePart);
  const day = DAY_LABELS[new Date(`${datePart}T12:00:00`).getDay()];
  return `${short} (${day})`;
}

function isRepeating(group: AdminSessionGroup): boolean {
  return group.recurrenceType !== null && group.recurrenceType !== 'NONE';
}

export { formatGroupDateRange, formatTimeRange, formatSessionDate, isRepeating };
