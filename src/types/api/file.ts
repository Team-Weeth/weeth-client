import type { components, operations } from '@/types/api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

/** 파일 저장 요청 (presigned URL 업로드 완료 후 서버에 전달) */
export type FileSaveRequest = S<'com.weeth.domain.file.application.dto.request.FileSaveRequest'>;

/** 파일 메타데이터 응답 */
export type FileResponse = S<'com.weeth.domain.file.application.dto.response.FileResponse'>;

/** Presigned URL 응답 */
export type PresignedUrl = S<'com.weeth.domain.file.application.dto.response.UrlResponse'>;

// ── Derived types ─────────────────────────────────────────────────────────────

/** 파일 소유 타입 (getUrl API의 ownerType 쿼리 파라미터) */
export type FileOwnerType = NonNullable<operations['getUrl']['parameters']['query']>['ownerType'];

/** 파일 상태 */
export type FileStatus = FileResponse['status'];
