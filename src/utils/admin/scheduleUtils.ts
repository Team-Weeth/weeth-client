import { DAY_META } from '@/constants/shared/date';

const INVALID_DATE_FALLBACK = '-';

// 'YYYY-MM-DD' 또는 'YYYY-MM-DDTHH:mm[:ss[.sss]][Z|±HH:mm]' 의 wall-clock 컴포넌트만 추출
const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/;

interface ParsedDate {
  year: number;
  month: number; // 1-12
  day: number;
  hours: number;
  minutes: number;
  dayOfWeek: number; // 0=일 ~ 6=토
}

// new Date()를 거치지 않고 문자열 컴포넌트에서 직접 추출 → 타임존 변환에 의한 날짜 어긋남 방지
function parseScheduleDate(dateString: string): ParsedDate | null {
  const match = ISO_PATTERN.exec(dateString);
  if (!match) return null;
  const [, y, mo, d, h = '0', mi = '0'] = match;
  const year = Number(y);
  const month = Number(mo);
  const day = Number(d);

  // 요일은 Date.UTC 기준으로 계산 (현지 TZ와 무관)
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

export function getDayLabel(dateString: string): string {
  const parsed = parseScheduleDate(dateString);
  return parsed ? DAY_META[parsed.dayOfWeek].en : INVALID_DATE_FALLBACK;
}

export function getDayOfMonth(dateString: string): number | null {
  const parsed = parseScheduleDate(dateString);
  return parsed ? parsed.day : null;
}

export function formatScheduleDateTime(dateString: string): string {
  const parsed = parseScheduleDate(dateString);
  if (!parsed) return INVALID_DATE_FALLBACK;

  const { month, day, hours, minutes } = parsed;
  const period = hours < 12 ? '오전' : '오후';
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');

  return `${month}월 ${day}일 ${period} ${displayHours}:${displayMinutes}`;
}

export function formatYearMonth(year: number, month: number): string {
  const shortYear = String(year).slice(2);
  return `${shortYear}년 ${month}월`;
}
