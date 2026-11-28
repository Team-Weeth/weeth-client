/**
 * 어드민 영역([data-admin])에서 default 스케일 타이포가 필요한 곳에 쓰는 클래스.
 *
 * [data-admin]은 typo-* 토큰을 한 단계 작게 덮어써서(예: typo-button1 16px → 14px),
 * 디자인이 어드민 화면에 default/* 타이포를 지정한 경우 토큰만으로는 표현할 수 없다.
 * 값은 globals.css :root의 default 토큰과 같다. 토큰 값이 바뀌면 함께 수정한다.
 */
export const ADMIN_DEFAULT_TYPO = {
  /** default/Sub1 — 18px / 22px / semibold */
  sub1: 'text-[18px] leading-[22px] font-semibold tracking-(--letter-spacing)',
  /** default/Body2 — 14px / 20px / regular (디자인 지정 400) */
  body2: 'text-[14px] leading-[20px] font-normal tracking-(--letter-spacing)',
  /** default/Button1 — 16px / 24px / semibold */
  button1: 'text-[16px] leading-[24px] font-semibold tracking-(--letter-spacing)',
} as const;
