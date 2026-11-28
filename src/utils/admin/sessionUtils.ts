import { DAY_META } from '@/constants/shared/date';
import type { SessionStatus } from '@/types/admin/session';

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
  const hours = Number(h);
  const minutes = Number(mi);

  // 시간/분 범위 가드 (ISO_PATTERN의 \d{2}는 숫자 개수만 보장하고 25:99 같은 값도 통과시키므로 별도 검증)
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

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
    hours,
    minutes,
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

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

// 시작/종료 날짜와 오늘을 비교해 SCHEDULED(예정) | OPEN(진행중) | COMPLETED(종료) 도출
export function deriveStatusFromDateRange(
  start: string,
  end: string,
): 'SCHEDULED' | 'OPEN' | 'COMPLETED' {
  const startDate = start.split('T')[0];
  const endDate = end.split('T')[0];
  if (!startDate || !endDate) return 'SCHEDULED';

  const today = getTodayString();
  if (today < startDate) return 'SCHEDULED';
  if (today > endDate) return 'COMPLETED';
  return 'OPEN';
}

// COMPLETED/CANCELED는 서버 상태 유지, 그 외에는 날짜 기반으로 도출
export function deriveSessionStatus(
  status: SessionStatus,
  start: string,
  end: string,
): SessionStatus {
  if (status === 'COMPLETED' || status === 'CANCELED') return status;
  return deriveStatusFromDateRange(start, end);
}

// 자식(반복) 세션은 의미상 "시작 날짜에 열리는 1회차"로 간주.
// 백엔드가 자식 end를 그룹 기간만큼 늘려 보내는 케이스가 있어 start 날짜로만 판정.
export function deriveChildSessionStatus(status: SessionStatus, start: string): SessionStatus {
  return deriveSessionStatus(status, start, start);
}

// 월간 일정 목록(Schedule)에는 세션 상태가 없어, 세션 목록과 같은 날짜 기준(시작일이 오늘이면 진행 중)으로 판정한다.
// TODO: [백엔드] 월간 일정 응답(GET /admin/clubs/{clubId}/events)에 세션 status(OPEN·COMPLETED·CANCELED 등)를
// 포함해 달라고 요청. 날짜 추정은 당일 조기 종료·취소된 세션도 진행 중으로 오판한다. 받게 되면 status 기준으로 교체.
export function isSessionInProgress(start: string): boolean {
  return deriveStatusFromDateRange(start, start) === 'OPEN';
}
