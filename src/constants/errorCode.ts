export const CLUB_JOIN_ERROR_CODE = {
  INVALID_INVITE_LINK: 21101,
  ALREADY_JOINED: 21102,
  CLUB_MEMBER_LIMIT_EXCEEDED: 21110,
} as const;

export const MEMBER_CARDINAL_ERROR_CODE = {
  /** 삭제하려는 기수에 출석/결석 기록이 존재 — force=true 재요청 필요 */
  REMOVAL_HAS_ATTENDANCE: 21118,
} as const;
