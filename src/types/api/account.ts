import type { components } from '@/types/api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

// ── Responses ─────────────────────────────────────────────────────────────────

/** 회비 거래 내역 목록 응답 (건수 요약 + 집계 행 + 슬라이스) */
export type MemberAccountTransactions =
  S<'com.weeth.domain.account.application.dto.response.MemberAccountTransactionsResponse'>;

/** 필터 탭별 거래 건수 요약 */
export type TransactionCounts =
  S<'com.weeth.domain.account.application.dto.response.MemberAccountTransactionsResponse.TransactionCountsResponse'>;

/** 회비 집계 행 */
export type AccountDuesSummary =
  S<'com.weeth.domain.account.application.dto.response.MemberAccountTransactionsResponse.DuesSummaryResponse'>;

/** 거래 내역 아이템 */
export type MemberTransaction =
  S<'com.weeth.domain.account.application.dto.response.MemberTransactionResponse'>;

/** 거래 상세 (영수증 포함) */
export type MemberTransactionDetail =
  S<'com.weeth.domain.account.application.dto.response.MemberTransactionDetailResponse'>;

/** 나의 회비 정보 */
export type MyAccount =
  S<'com.weeth.domain.account.application.dto.response.MyAccountResponse'>;

/** 나의 납부 상태 */
export type MyPayment =
  S<'com.weeth.domain.account.application.dto.response.MyAccountResponse.MyPaymentResponse'>;

/** 잔액·목표액 */
export type AccountBalance =
  S<'com.weeth.domain.account.application.dto.response.MyAccountResponse.BalanceResponse'>;

/** 계좌 정보 */
export type BankAccount =
  S<'com.weeth.domain.account.application.dto.response.BankAccountResponse'>;

/** 회비 기능 공개 여부 */
export type AccountVisibility =
  S<'com.weeth.domain.account.application.dto.response.AccountVisibilityResponse'>;

/** 회비 기수 아이템 */
export type AccountCardinal =
  S<'com.weeth.domain.account.application.dto.response.AccountCardinalResponse'>;

/** 거래 내역 슬라이스 (페이지네이션 wrapper 포함) */
export type MemberTransactionSlice =
  S<'com.weeth.global.common.response.SliceResponseCom.weeth.domain.account.application.dto.response.MemberTransactionResponse'>;

// ── Derived types ─────────────────────────────────────────────────────────────

/** 거래 유형 */
export type TransactionType = MemberTransaction['type'];

/** 거래 방향 */
export type TransactionDirection = MemberTransaction['direction'];

/** 납부 상태 */
export type PaymentStatus = NonNullable<MyPayment['status']>;
