# 테스트 커버리지 — Home 도메인

`src/components/home/` 하위 파일의 통합 테스트 커버리지를 기록한다.

---

## HomeBoardContent (`src/components/home/HomeBoardContent.tsx`)

**측정일**: 2026-10-22
**테스트 파일**: `src/components/home/__tests__/HomeBoardContent.test.tsx`
**총 테스트 수**: 10개

### 파일별 커버리지

| 파일 | Statements | Branches | Functions | Lines |
|------|-----------|---------|---------|-------|
| `HomeBoardContent.tsx` | **98.69%** | **81.81%** | **75%** | **98.69%** |

### 테스트 구성

#### `HomeBoardContent.test.tsx` (10개)

홈 최신 게시글 목록 컴포넌트. `apiClient.get`을 직접 mock해 의존성을 제어하고 React Query + `createWrapper`로 감싸 통합 검증. `../board` 배럴이 ESM 의존성을 끌어들이므로 `@/components/board` 배럴 전체를 mock한다.

| 케이스 | 검증 내용 |
|--------|---------|
| 로딩 중 스켈레톤 | `[data-slot="skeleton"]` 존재 |
| 게시글 제목 렌더링 | 데이터 로드 후 제목 표시 |
| 게시글 작성자 렌더링 | 작성자 이름 표시 |
| 댓글 버튼 → 경로 이동 | `router.push` 호출 경로에 `#comments` 포함 |
| 빈 상태 (일반 회원) | "아직 게시된 글이 없어요!" 표시 |
| 빈 상태 (관리자) | "사이트 개설을 축하합니다!" 표시 |
| 스크롤 복원 — 위치 있음 | `sessionStorage` 키 `scroll:home:recent-posts:{clubId}` → `window.scrollTo` 호출 |
| 스크롤 복원 — 위치 없음 | `window.scrollTo` 미호출 |
| 스크롤 복원 — 다른 클럽 키 | 현재 클럽 키가 아니면 `window.scrollTo` 미호출 |
| 스크롤 복원 — 다음 페이지 필요 | `last: false` → 스크롤 복원 중 `fetchNextPage` 트리거 |

### 미커버 브랜치

| 라인 | 내용 | 이유 |
|------|------|------|
| 60-61 | `isIntersecting && hasNextPage` → `fetchNextPage` | `useIntersectionObserver`가 항상 `isIntersecting: false`를 반환하도록 mock되어 있어 교차 관찰 경로 미재현. IntersectionObserver 실제 동작은 E2E 대상 |

---

## 추가 예정

| 파일 | 우선순위 | 비고 |
|------|---------|------|
| `HomeDashboard.tsx` | 중간 | React Query 통합 |
