/**
 * 세션 테이블 컬럼 너비 정의.
 *
 * 두 가지 정보를 함께 관리한다:
 * - `width`: 숫자 (px). min-width 합산 계산용
 * - `widthClass`: Tailwind 클래스 문자열 (JIT가 정적으로 감지하도록 완성된 문자열)
 *
 * 너비를 바꾸려면 이 파일만 수정하면 되고, 테이블 전체 min-width(= SESSION_TABLE_MIN_WIDTH)도 자동 반영된다.
 */
export const SESSION_TABLE_COLUMNS = {
  /** sticky 영역 내부: 토글 버튼 공간 */
  toggle: { width: 56, widthClass: 'w-[56px]' },
  /** sticky 영역 전체: 토글 + 세션 제목 wrapper */
  titleSticky: { width: 306, widthClass: 'w-[306px]' },
  /** 날짜 (부모 테이블) */
  date: { width: 206, widthClass: 'w-[206px]' },
  /** 반복 설정 */
  recurrence: { width: 241, widthClass: 'w-[241px]' },
  /** 진행 차수 */
  progress: { width: 102, widthClass: 'w-[102px]' },
  /** 상태 */
  status: { width: 102, widthClass: 'w-[102px]' },
  /** 출석 관리 */
  attendance: { width: 112, widthClass: 'w-[112px]' },
  /** 더보기 영역 */
  more: { width: 71, widthClass: 'w-[71px]' },
  /**
   * child 테이블에서 날짜+반복+차수를 병합한 컬럼.
   * 부모 테이블의 (date + recurrence + progress)와 동일한 너비를 유지해야 정렬이 맞다.
   */
  childDate: { width: 549, widthClass: 'w-[549px]' },
} as const;

/**
 * 테이블 전체 최소 너비 (px).
 * sticky 컬럼 + 부모 테이블의 나머지 컬럼 + more 영역의 합.
 */
export const SESSION_TABLE_MIN_WIDTH =
  SESSION_TABLE_COLUMNS.titleSticky.width +
  SESSION_TABLE_COLUMNS.date.width +
  SESSION_TABLE_COLUMNS.recurrence.width +
  SESSION_TABLE_COLUMNS.progress.width +
  SESSION_TABLE_COLUMNS.status.width +
  SESSION_TABLE_COLUMNS.attendance.width +
  SESSION_TABLE_COLUMNS.more.width;
