import type { components } from '@/types/admin-api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

// ── Requests ──────────────────────────────────────────────────────────────────

/** 회비 기본 정보 저장 요청 ([2단계]) */
export type AdminSaveAccountBasicRequest =
  S<'com.weeth.domain.account.application.dto.request.SaveAccountBasicRequest'>;

/** 회비 납부 대상 저장 요청 ([3단계], 스냅샷 방식) */
export type AdminSavePaymentTargetsRequest =
  S<'com.weeth.domain.account.application.dto.request.SavePaymentTargetsRequest'>;

/** 회비 이월 설정 저장 요청 ([4단계]) */
export type AdminSaveCarryOverRequest =
  S<'com.weeth.domain.account.application.dto.request.SaveAccountCarryOverRequest'>;

/** 회비 계좌 설정 저장 요청 ([5단계]) */
export type AdminSaveBankAccountRequest =
  S<'com.weeth.domain.account.application.dto.request.SaveAccountBankAccountRequest'>;

/** 계좌 정보 */
export type AdminBankAccountRequest =
  S<'com.weeth.domain.account.application.dto.request.BankAccountRequest'>;

/** 거래 내역 추가 요청 */
export type AdminSaveTransactionRequest =
  S<'com.weeth.domain.account.application.dto.request.SaveAccountTransactionRequest'>;

/** 거래 내역 수정 요청 */
export type AdminUpdateTransactionRequest =
  S<'com.weeth.domain.account.application.dto.request.UpdateAccountTransactionRequest'>;

/** 납부 확인(벌크) 요청 */
export type AdminMarkPaymentPaidRequest =
  S<'com.weeth.domain.account.application.dto.request.MarkPaymentPaidRequest'>;

/** 납부 정정(벌크) 요청 */
export type AdminMarkPaymentUnpaidRequest =
  S<'com.weeth.domain.account.application.dto.request.MarkPaymentUnpaidRequest'>;

/** 환불(벌크) 요청 */
export type AdminRefundPaymentRequest =
  S<'com.weeth.domain.account.application.dto.request.RefundPaymentRequest'>;

/** 납부 대상 제외(벌크) 요청 */
export type AdminExcludePaymentTargetsRequest =
  S<'com.weeth.domain.account.application.dto.request.ExcludePaymentTargetsRequest'>;

/** 회비 기능 공개 여부 수정 요청 */
export type AdminUpdateMemberVisibilityRequest =
  S<'com.weeth.domain.account.application.dto.request.UpdateMemberVisibilityRequest'>;

// ── Responses ─────────────────────────────────────────────────────────────────

/** 회비 등록 초안 생성 응답 ([1단계]) */
export type AdminCreateAccountDraft =
  S<'com.weeth.domain.account.application.dto.response.CreateAccountDraftResponse'>;

/** 거래 내역 아이템 (어드민용, 잔액 포함) */
export type AdminAccountTransaction =
  S<'com.weeth.domain.account.application.dto.response.AccountTransactionResponse'>;

/** 회비 대시보드 */
export type AdminAccountDashboard =
  S<'com.weeth.domain.account.application.dto.response.AccountDashboardResponse'>;

/** 대시보드 수정자 정보 */
export type AdminAccountModifier =
  S<'com.weeth.domain.account.application.dto.response.AccountDashboardResponse.ModifierResponse'>;

/** 대시보드 마지막 수정 정보 */
export type AdminAccountLastModified =
  S<'com.weeth.domain.account.application.dto.response.AccountDashboardResponse.LastModifiedResponse'>;

// ── Derived types ─────────────────────────────────────────────────────────────

/** 거래 유형 (어드민용, 시스템 거래 포함) */
export type AdminTransactionType = AdminAccountTransaction['type'];

/** 거래 방향 */
export type AdminTransactionDirection = AdminAccountTransaction['direction'];
