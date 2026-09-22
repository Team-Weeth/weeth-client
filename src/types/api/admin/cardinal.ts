import type { components } from '@/types/admin-api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

// ── Requests ──────────────────────────────────────────────────────────────────

/** 새 기수 저장 요청 */
export type AdminCardinalSaveRequest =
  S<'com.weeth.domain.cardinal.application.dto.request.CardinalSaveRequest'>;
