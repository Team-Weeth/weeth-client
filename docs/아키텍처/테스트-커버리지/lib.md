# 테스트 커버리지 — Lib 도메인

`src/lib/` 하위 유틸리티 함수의 단위 테스트 커버리지를 기록한다.

---

## getUnreferencedFiles (`src/lib/board/getUnreferencedFiles.ts`)

**측정일**: 2026-10-05
**테스트 파일**: `src/lib/board/__tests__/getUnreferencedFiles.test.ts`
**총 테스트 수**: 14개

### 파일별 커버리지

| 파일 | Statements | Branches | Functions | Lines |
|------|-----------|---------|---------|-------|
| `getUnreferencedFiles.ts` | **100%** | **100%** | **100%** | **100%** |

### 테스트 구성

#### `getUnreferencedFiles.test.ts` (14개)

HTML 내 `src="/..."` 또는 `data-src="/..."` 속성에 URL이 참조됐는지 판별하는 유틸리티. 본문 텍스트·다른 속성 노출 방지, URL 인코딩(공백 ↔ `%20`)·HTML 엔티티(`&` ↔ `&amp;`) 변형 허용.

| 케이스 | 검증 내용 |
|--------|---------|
| `src="url"` 포함 | `true` |
| `data-src="url"` 포함 | `true` |
| 본문 텍스트에만 URL 등장 | `false` (속성 외 참조 불허) |
| `href` 등 다른 속성 | `false` |
| HTML에 URL 없음 | `false` |
| HTML 빈 문자열 | `false` |
| `fileUrl` 공백 → HTML `%20` | `true` |
| `fileUrl` `%20` → HTML 공백 | `true` |
| `fileUrl` `&` → HTML `&amp;` | `true` |
| `fileUrl` 리터럴 `&amp;` vs HTML `&` | `false` (단방향 변환만 허용) |
| `getUnreferencedFiles` — 모두 참조됨 | 빈 배열 반환 |
| `getUnreferencedFiles` — 일부만 참조됨 | 미참조 파일만 반환 |
| `getUnreferencedFiles` — HTML 빈 문자열 | 전체 파일 반환 |
| `getUnreferencedFiles` — 파일 목록 빈 배열 | 빈 배열 반환 |

---

## 추가 예정

| 파일 | 우선순위 | 비고 |
|------|---------|------|
| `src/lib/board/fileUtils.ts` | 중간 | `isImageFileName` 등 파일명 유틸리티 |
