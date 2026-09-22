export const mypageQueryKeys = {
  /** 마이페이지 프로필 요약. 어드민에서 포지션을 바꾸면 여기 표시되는 태그도 바뀐다. */
  summary: (clubId: string | null) => ['mypage', 'summary', clubId] as const,
} as const;
