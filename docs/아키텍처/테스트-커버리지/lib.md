# 테스트 커버리지 — Lib 도메인

`src/lib/` 하위 유틸리티 함수의 단위 테스트 커버리지를 기록한다.

---

## getUnreferencedFiles (`src/lib/board/getUnreferencedFiles.ts`)

**측정일**: 2026-10-31
**테스트 파일**: `src/lib/board/__tests__/getUnreferencedFiles.test.ts`
**총 테스트 수**: 25개

### 파일별 커버리지

| 파일 | Statements | Branches | Functions | Lines |
|------|-----------|---------|---------|-------|
| `getUnreferencedFiles.ts` | 95.09% | 90.32% | **100%** | 95.09% |

### 테스트 구성

#### `isReferencedInContent` (14개)

HTML 내 `src`/`data-src` 속성에 URL이 참조됐는지 판별. 본문 텍스트·다른 속성 노출 방지, 공백↔`%20` 인코딩·`&`↔`&amp;` 엔티티 허용.

| 케이스 | 검증 내용 |
|--------|---------|
| `src="url"` 포함 | `true` |
| `data-src="url"` 포함 | `true` |
| 본문 텍스트에만 URL 등장 | `false` |
| `href` 등 다른 속성 | `false` |
| HTML에 URL 없음 | `false` |
| HTML 빈 문자열 | `false` |
| fileUrl 공백 → HTML `%20` (양방향 6케이스) | `true` |
| fileUrl `&` → HTML `&amp;` | `true` |

#### `isFileReferencedInContent` (11개)

CDN↔S3 도메인 불일치 환경에서 storageKey 우선 비교 → URL 비교 → 경로 비교 순으로 폴백.

| 케이스 | 검증 내용 |
|--------|---------|
| storageKey 일치 (CDN·S3 도메인 다름) | `true` |
| storageKey 불일치 (파일 자체가 다름) | `false` |
| storageKey 없음 → URL 비교로 폴백 | `true`/`false` |
| 본문에 인라인 참조 없음 | `false` |
| `data-original-src` 등 유사 속성명 | `false` (오탐 방지) |
| 쿼리 붙은 presigned URL | `true` |
| CDN·S3 도메인 다름 + 동일 경로 | `true` (3단계 경로 폴백) |
| CDN·S3 도메인 다름 + 다른 경로 | `false` |
| CDN URL에 쿼리 + S3 src에 쿼리 없음 | `true` (쿼리 제거 후 경로 비교) |
| 경로 퍼센트 인코딩 차이 | `true` (디코딩 후 비교) |
| `storageKey: ''` 명시 + 경로 일치 | `true` |

### 미커버 분기

| 라인 | 내용 | 이유 |
|------|------|------|
| 59–61 | `decodeSafely` catch 블록 | 잘못된 퍼센트 인코딩(`%ZZ` 등)이어야 트리거. 방어 코드로 실사용 불가 경로 |
| 71–72 | `toDecodedPath` catch 블록 | `new URL()`이 예외를 던지는 상대 경로 입력이어야 트리거. 동일하게 방어 코드 |

---

## 추가 예정

| 파일 | 우선순위 | 비고 |
|------|---------|------|
| `src/lib/board/fileUtils.ts` | 중간 | `isImageFileName` 등 파일명 유틸리티 |
