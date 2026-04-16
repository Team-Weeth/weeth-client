import { DAY_META } from '@/constants/shared/date';

const INVALID_DATE_FALLBACK = '-';

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/;

interface ParsedSessionDate {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  dayOfWeek: number;
}

function parseSessionDate(dateString: string): ParsedSessionDate | null {
  const match = ISO_PATTERN.exec(dateString);
  if (!match) return null;

  const [, y, mo, d, h = '0', mi = '0'] = match;
  const year = Number(y);
  const month = Number(mo);
  const day = Number(d);

  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(utc.getTime()) ||
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }

  return {
    year,
    month,
    day,
    hours: Number(h),
    minutes: Number(mi),
    dayOfWeek: utc.getUTCDay(),
  };
}

const pad2 = (n: number) => String(n).padStart(2, '0');

export function formatSessionDate(dateString: string): string {
  const parsed = parseSessionDate(dateString);
  return parsed
    ? `${parsed.year}.${pad2(parsed.month)}.${pad2(parsed.day)}`
    : INVALID_DATE_FALLBACK;
}

export function formatSessionDateRange(start: string, end: string): string {
  return `${formatSessionDate(start)} ~ ${formatSessionDate(end)}`;
}

export function formatSessionDayLabel(dateString: string): string {
  const parsed = parseSessionDate(dateString);
  return parsed ? `${DAY_META[parsed.dayOfWeek].ko}요일` : INVALID_DATE_FALLBACK;
}

export function formatSessionTime(dateString: string): string {
  const parsed = parseSessionDate(dateString);
  if (!parsed) return INVALID_DATE_FALLBACK;

  const period = parsed.hours < 12 ? '오전' : '오후';
  const displayHours = parsed.hours % 12 || 12;
  return `${period} ${displayHours}:${pad2(parsed.minutes)}`;
}

export function formatSessionTimeRange(start: string, end: string): string {
  return `${formatSessionTime(start)} ~ ${formatSessionTime(end)}`;
}
