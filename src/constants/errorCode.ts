export const CLUB_JOIN_ERROR_CODE = {
  INVALID_INVITE_LINK: 21101,
  ALREADY_JOINED: 21102,
  CLUB_MEMBER_LIMIT_EXCEEDED: 21110,
} as const;

export const MEMBER_CARDINAL_ERROR_CODE = {
  /** 삭제하려는 기수에 출석/결석 기록이 존재 — force=true 재요청 필요 */
  REMOVAL_HAS_ATTENDANCE: 21118,
} as const;

export const MEMBER_ROLE_ERROR_CODE = {
  /** LEAD만 권한 이양 가능 */
  ONLY_LEAD_CAN_TRANSFER: 21113,
  /** LEAD는 이양을 통해서만 변경 가능 */
  LEAD_TRANSFER_ONLY: 21114,
} as const;

export const CARDINAL_ERROR_CODE = {
  /** 이미 존재하는 기수 */
  ALREADY_EXISTS: 21001,
} as const;

export const DUES_REGISTRATION_ERROR_CODE = {
  /** 이미 완료된 장부 */
  ALREADY_COMPLETED: 20104,
  /** 모든 단계가 저장되지 않은 미완료 상태 */
  NOT_COMPLETED: 20107,
  /** 이월 금액이 완료 시점의 이전 기수 잔액과 다름 — 이월 설정 재저장 후 재시도 필요 */
  CARRY_OVER_MISMATCH: 20108,
} as const;
