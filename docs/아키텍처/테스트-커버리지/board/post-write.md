# 테스트 커버리지 — Board › 게시글 작성 Shell

`src/components/board/` 및 `src/hooks/board/` 중 게시글 작성·수정 UI 주변 파일의 커버리지를 기록한다.

---

## PostEditorShell 주변 (`src/components/board/` + `src/hooks/board/`)

**측정일**: 2026-06-25
**테스트 파일**: `src/components/board/__tests__/` · `src/hooks/board/__tests__/`
**총 테스트 수**: 34개

### 파일별 커버리지

#### 측정 전 (기존)

| 파일 | Statements | Branches | Functions | Lines |
|------|-----------|---------|---------|-------|
| `TitleInput.tsx` | **0%** | **0%** | **0%** | **0%** |
| `validatePost.ts` | **0%** | **0%** | **0%** | **0%** |
| `resolveFilesPayload.ts` | **0%** | **0%** | **0%** | **0%** |
| `useDirtyActionGuard.ts` | **0%** | **0%** | **0%** | **0%** |

#### 측정 후 (개선)

| 파일 | Statements | Branches | Functions | Lines |
|------|-----------|---------|---------|-------|
| `TitleInput.tsx` | **100%** | **100%** | **100%** | **100%** |
| `validatePost.ts` | **100%** | **100%** | **100%** | **100%** |
| `resolveFilesPayload.ts` | **100%** | **100%** | **100%** | **100%** |
| `useDirtyActionGuard.ts` | **100%** | **100%** | **100%** | **100%** |

### 테스트 구성

#### `validatePost.test.ts` (10개)

게시글 제출 전 유효성 검사 함수. toast 사이드 이펙트 포함.

| 케이스 | 검증 내용 |
|--------|---------|
| `clubId === null` | false + error toast |
| `title = ''` | false + error toast |
| `title = '   '` (공백만) | false (trim 적용) |
| `title = ' 제목 '` | true (trim 후 내용 있음) |
| content 빈 HTML `<p></p>` | false + error toast |
| content 빈 문자열 | false |
| content 텍스트 있는 HTML | true |
| 업로드 중인 파일 (`!uploaded && file`) | false + error toast |
| 업로드 완료 파일 (`uploaded=true`) | true |
| `file` 프로퍼티 없는 항목 (기존 서버 파일) | 업로드 중으로 간주하지 않음 |

> `toast` mock, `isHtmlEmpty`는 실제 함수 사용 (순수 함수라 mock 불필요)

#### `resolveFilesPayload.test.ts` (7개)

작성/수정 모드 파일 payload 결정 함수. snapshot 비교 로직.

| 케이스 | 검증 내용 |
|--------|---------|
| 작성 모드 (`snapshot=null`) | 전체 파일 → 4개 필드 매핑 |
| 작성 모드, 파일 없음 | 빈 배열 반환 |
| 수정 모드, 변경 없음 | `null` 반환 |
| 수정 모드, 파일 순서만 다름 | `null` 반환 (내용 동일) |
| 수정 모드, 새 파일 추가 | 전체 파일 반환 |
| 수정 모드, 기존 파일 삭제 | 남은 파일 반환 |
| 수정 모드, snapshot·current 모두 비어 있음 | `null` 반환 |

#### `useDirtyActionGuard.test.ts` (9개)

dirty 상태일 때 액션을 가로채는 훅. 외부 의존성 없음.

| 케이스 | 검증 내용 |
|--------|---------|
| 초기 상태 | `pendingAction=null`, `guardOpen=false` |
| `requestAction` (isDirty=false) | `false` 반환, 상태 불변 |
| `requestAction` (isDirty=true) | `true` 반환, `guardOpen=true`, `pendingAction=id` |
| `requestAction` 연속 호출 | 마지막 id로 덮어씀 |
| `confirm` (pending 있음) | id 반환, 초기화 |
| `confirm` (pending 없음) | `null` 반환 |
| `cancel` | `pendingAction=null`, `guardOpen=false` |
| cancel 후 requestAction 재호출 | 정상 동작 |

#### `TitleInput.test.tsx` (8개)

textarea 기반 제목 입력 컴포넌트. Enter 차단 · IME 대응.

| 케이스 | 검증 내용 |
|--------|---------|
| 렌더링 | placeholder "제목" 노출 |
| Enter 입력 | 줄바꿈(`\n`) 추가되지 않음 |
| Enter + `onKeyDown` prop | 외부 핸들러는 여전히 호출됨 |
| 일반 키 입력 | 차단하지 않음 |
| `onChange` prop | 입력마다 호출됨 |
| maxLength(100) | 100자 초과 입력 잘림 |
| `className` prop | wrapper div에 적용됨 |

---

## CategorySelector · BoundTitleInput (`src/components/board/`)

**측정일**: 2026-06-29
**테스트 파일**: `src/components/board/__tests__/CategorySelector.test.tsx` · `BoundTitleInput.test.tsx`
**총 테스트 수**: 15개 (CategorySelector 11개 + BoundTitleInput 4개)

### 파일별 커버리지

| 파일 | Statements | Branches | Functions | Lines |
|------|-----------|---------|---------|-------|
| `CategorySelector.tsx` | **100%** | **77.77%** | **100%** | **100%** |
| `BoundTitleInput.tsx` | **100%** | **100%** | **100%** | **100%** |

### 테스트 구성

#### `CategorySelector.test.tsx` (11개)

글쓰기 페이지 채널 선택 드롭다운. `@/components/ui` Radix 컴포넌트를 Context 기반 경량 mock으로 대체, `ChannelList`는 `jest.fn()` mock으로 격리.

| 케이스 | 검증 내용 |
|--------|---------|
| 렌더링 (3) | 크래시 없음 / activeId에 해당하는 채널명 표시 / activeId=null이면 빈 채널명 |
| 드롭다운 열기/닫기 (3) | 초기 닫힘 / 트리거 클릭 → 열림 / 항목 선택 후 닫힘 |
| filterAll=true (기본값) | ALL 타입 항목이 ChannelList에 전달되지 않음 |
| filterAll=false | ALL 타입 항목도 ChannelList에 전달됨 |
| onItemSelect 콜백 (2) | 선택 시 해당 id로 호출됨 / prop 없어도 에러 없음 |
| ChannelList props | activeId가 그대로 전달됨 |

#### `BoundTitleInput.test.tsx` (4개)

PostStore에 바인딩된 TitleInput. `usePostStore`를 selector 패턴으로 mock.

| 케이스 | 검증 내용 |
|--------|---------|
| 렌더링 | 크래시 없음 |
| Store title 표시 | PostStore의 title 값이 입력창에 표시됨 |
| setTitle 호출 | 타이핑 시 setTitle이 입력값으로 호출됨 |
| title 변경 반영 | mock title 변경 시 새 값이 표시됨 |

---

## E2E (`e2e/specs/post-write.spec.ts`)

**측정일**: 2026-06-29
**테스트 수**: 6개

| 시나리오 | 검증 내용 |
|----------|---------|
| 정상 작성 후 리다이렉트 | 제목·내용 입력 → "게시하기" → `waitForURL`로 `/{clubId}/board/{boardId}/{postId}` 도달 확인 / URL에 `/write` 미포함 |
| 제목 미입력 유효성 검사 | 본문만 입력 → "게시하기" → "제목을 입력해주세요." 에러 토스트 / `/write` 잔류 |
| 내용 미입력 유효성 검사 | 제목만 입력 → "게시하기" → "내용을 입력해주세요." 에러 토스트 / `/write` 잔류 |
| 네비게이션 가드 — 다이얼로그 표시 | 본문 입력(hasChanges=true) → "작성 취소" → "변경 사항이 저장되지 않았어요" 다이얼로그 표시 |
| 네비게이션 가드 — "계속 작성" | 다이얼로그 열림 → "계속 작성" → 다이얼로그 닫힘 / `/write` 잔류 |
| 네비게이션 가드 — 게시 완료 후 guard 해제 | "게시하기" → `_allowNavigation()` 체인 → 상세 페이지에서 다이얼로그 미표시 |

> **전제 조건**: `DEV_ACCESS_TOKEN` 설정 + 쓰기 가능한 게시판이 1개 이상 있는 클럽
> `ClientEditor`의 `writableItems[0]`이 자동 선택되므로 별도 게시판 선택 불필요

---

## E2E (`e2e/specs/post-edit.spec.ts`)

**측정일**: 2026-06-29
**테스트 수**: 3개

| 시나리오 | 검증 내용 |
|----------|---------|
| 수정 완료 후 리다이렉트 | "수정 완료" 클릭 → `waitForURL`로 `/{clubId}/board/{boardId}/{postId}` 도달 확인 / URL에 `/edit/` 미포함 확인 |
| 네비게이션 가드 — 다이얼로그 표시 | 제목 수정(snapshot 불일치 → hasChanges=true) → "수정 취소" → "변경 사항이 저장되지 않았어요" 다이얼로그 표시 |
| 네비게이션 가드 — 수정 완료 후 guard 해제 | "수정 완료" → `_allowNavigation()` 체인 → 상세 페이지에서 다이얼로그 미표시 |

> **전제 조건**: `DEV_ACCESS_TOKEN` 설정 + 쓰기 가능한 게시판이 1개 이상 있는 클럽
> `beforeAll`에서 테스트용 게시글을 실제 작성한 뒤 `postId`·`boardId`를 URL에서 추출해 사용

---

### 미커버 브랜치

| 파일 | 라인 | 내용 | 이유 |
|-----|------|------|------|
| `CategorySelector.tsx` | 43 | `clubName ?? '게시판'` null 분기 | `boardName` 변수가 JSX에서 미사용 (사실상 dead code) |
| `CategorySelector.tsx` | 44 | `activeItem?.label ?? ''` undefined 분기 | activeId와 매칭되는 아이템이 없는 경우 — 실제 사용 시 발생 불가 |
