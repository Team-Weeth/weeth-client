# 테스트 커버리지 — Hooks 도메인

`src/hooks/` 하위 파일의 단위 훅 테스트 커버리지를 기록한다.

---

## useNavigationGuard (`src/hooks/useNavigationGuard.ts`)

**측정일**: 2026-06-29
**테스트 파일**: `src/hooks/__tests__/useNavigationGuard.test.ts`
**총 테스트 수**: 24개

### 파일별 커버리지

| 파일 | Statements | Branches | Functions | Lines |
|------|-----------|---------|---------|-------|
| `useNavigationGuard.ts` | **91.32%** | **82.97%** | **100%** | **91.32%** |

### 테스트 구성

#### `useNavigationGuard.test.ts` (24개)

브라우저 뒤로가기(popstate), 탭 닫기(beforeunload), 링크 클릭을 가로채는 내비게이션 가드 훅. `history.pushState`·`history.back`을 spy로 대체하고 DOM 이벤트를 직접 dispatch해 동작 검증.

| 케이스 | 검증 내용 |
|--------|---------|
| 초기 상태 | `open=false` |
| guard entry 등록 (3) | enabled=true → pushState 호출 / enabled=false → 호출 안 함 / false→true 변경 → pushState |
| popstate (2) | enabled=true → 다이얼로그 열림 / enabled=false → 열리지 않음 |
| onConfirm (2) | pendingUrl 없음 → history.back + 닫힘 / pendingUrl 있음 → router.push + 닫힘 |
| onCancel (2) | popstate 후 → 닫힘 + guard entry 재설정 / 링크 클릭 후 → 닫힘 |
| 링크 클릭 인터셉트 (6) | 같은 origin 다른 경로 → 열림 / 동일 URL → 안 열림 / 외부 도메인 → 안 열림 / target=_blank → 안 열림 / enabled=false → 안 열림 / ctrl/meta 클릭 → 안 열림 |
| beforeunload (2) | enabled=true → preventDefault 호출 / enabled=false → 호출 안 함 |
| allowNavigation (2) | 호출 후 popstate 발생해도 열리지 않음 / 호출 후 링크 클릭해도 열리지 않음 |
| Bug 1 회귀 (2) | 뒤로가기→취소→재시도 시 다이얼로그 다시 열림 / onConfirm 후 enabled false→true 재전환 시 다음 뒤로가기에서 열림 |
| Bug 2 회귀 (2) | onConfirm 직후 popstate로 다이얼로그 재표시 안 됨 / onCancel은 isLeaving 상태 무관하게 항상 다이얼로그를 닫음 |

### 미커버 브랜치

| 라인 | 내용 | 이유 |
|-----|------|------|
| 41-49 | `scheduleGuardReset` 내 setTimeout 콜백 | 3000ms 타이머 + 실제 URL 변경 없이 재현 불가. 실제 네비게이션 발생 여부 확인 로직으로 E2E 대상 |
| 76-78 | popstate에서 `enabled=false && hasGuardEntry=true` 분기 | pushState를 spy no-op으로 처리해 hasGuardEntry가 true로 세팅되지 않는 상태 조합 |

---

---

## useUpdatePost (`src/hooks/board/useUpdatePost.ts`)

**측정일**: 2026-10-05
**테스트 파일**: `src/hooks/board/__tests__/useUpdatePost.test.ts`
**총 테스트 수**: 9개

### 파일별 커버리지

| 파일 | Statements | Branches | Functions | Lines |
|------|-----------|---------|---------|-------|
| `useUpdatePost.ts` | **97.39%** | **75%** | **100%** | **97.39%** |

### 테스트 구성

#### `useUpdatePost.test.ts` (9개)

게시글 수정 뮤테이션 훅. `usePostStore.getState()` 직접 호출 방식으로 스냅샷 diff 계산. `jest.useFakeTimers()`로 `setTimeout(push, 0)` 리다이렉트 누수 방지.

| 케이스 | 검증 내용 |
|--------|---------|
| `updatePostApi` 올바른 인자 호출 | `clubId`, `boardId`, `postId`, `{ title, content, files: null }` |
| `validatePost=false` | `updatePostApi` 미호출 |
| HTML 등장 순서대로 파일 정렬 | b.png → a.png 순서로 API에 전달 |
| `&amp;` 엔티티 디코딩 | URL에 `&amp;`가 포함된 img src를 올바르게 매칭 |
| 성공 시 성공 토스트 | `toast({ variant: 'success' })` 호출 |
| 성공 시 `router.push` | 게시글 상세 경로로 이동 |
| 성공 시 `store.reset` | 스토어 초기화 |
| API 오류 시 에러 토스트 | `toast({ variant: 'error' })` 호출 |
| `mutate` 호출 중 `isPending=true` | 비동기 중간 상태 검증 |

### 미커버 브랜치

| 라인 | 내용 | 이유 |
|------|------|------|
| — | `_allowNavigation?.()` 및 일부 null 분기 | 25% 미커버; 스냅샷 null 등 엣지 케이스. `usePostStore._allowNavigation` 주입 없이 재현 어려움 |

---

## useInlineFileUpload (`src/hooks/useInlineFileUpload.ts`)

**측정일**: 2026-10-05
**테스트 파일**: `src/hooks/__tests__/useInlineFileUpload.test.ts`
**총 테스트 수**: 7개

### 파일별 커버리지

| 파일 | Statements | Branches | Functions | Lines |
|------|-----------|---------|---------|-------|
| `useInlineFileUpload.ts` | **33.66%** | **77.77%** | **40%** | **33.66%** |

> Statement/Line 커버리지가 낮은 이유: `addFilesAndInsertNodes`, `removeNodeByUploadId`, `updateNodeByUploadId`, `markUploadedAndUpdateNode`는 실제 TipTap `Editor` 인스턴스와 ProseMirror 트랜잭션이 필요해 단위 테스트로 검증 불가. E2E 대상.

### 테스트 구성

#### `useInlineFileUpload.test.ts` (7개)

파일 업로드 후 에디터에 인라인 노드를 삽입하는 훅의 공개 인터페이스 검증. `useFileUploadCore`를 mock으로 대체해 에디터 의존성 없이 테스트.

| 케이스 | 검증 내용 |
|--------|---------|
| `confirmImageInsertMode` — `pendingImageItems=null` | early return, `chain()` 미호출 |
| `confirmImageInsertMode` — individual 모드 | store에 있는 항목만 삽입 대상 확인 |
| 업로드 실패 항목 제거 | store에 없는 id는 삽입에서 제외됨 확인 |
| `cancelImageInsertMode` — `pendingImageItems=null` | `removeFile` 미호출 |
| `setEditor(null)` | null 설정 후 크래시 없이 동작 |
| `processFilesInline` 참조 안정성 | 리렌더 후 동일 함수 참조 유지 |
| `openImagePicker` | `imageInputRef.current.click()` 호출 |

### 미커버 브랜치

| 내용 | 이유 |
|------|------|
| `addFilesAndInsertNodes` (파일→에디터 노드 삽입) | 실제 TipTap Editor 필요 → E2E 대상 |
| `removeNodeByUploadId` (ProseMirror 트랜잭션) | 실제 TipTap Editor 필요 → E2E 대상 |
| `updateNodeByUploadId` (업로드 완료 노드 갱신) | 실제 TipTap Editor 필요 → E2E 대상 |
| `markUploadedAndUpdateNode` | 실제 TipTap Editor 필요 → E2E 대상 |

---

## 추가 예정

| 파일 | 우선순위 | 비고 |
|------|---------|------|
| `useMonthNavigator.ts` | 완료 | `src/hooks/__tests__/useMonthNavigator.test.ts` |
| `useDiscardableForm.ts` | 완료 | `src/hooks/__tests__/useDiscardableForm.test.ts` |
| `useRemainingTime.ts` | 완료 | `src/hooks/__tests__/useRemainingTime.test.ts` |
| `useCardinalSelector.ts` | 완료 | `src/hooks/__tests__/useCardinalSelector.test.ts` |
