# 테스트 커버리지 — Board 도메인

`src/components/board/` 하위 파일의 단위·훅 테스트 커버리지를 기록한다.

---

## Editor (`src/components/board/Editor/`)

**측정일**: 2026-06-25
**테스트 파일**: `src/components/board/Editor/__tests__/`
**총 테스트 수**: 56개

### 파일별 커버리지

| 파일 | Statements | Branches | Functions | Lines |
|------|-----------|---------|---------|-------|
| `normalizeHref.ts` | **100%** | **100%** | **100%** | **100%** |
| `useLinkPopup.ts` | **100%** | **100%** | **100%** | **100%** |
| `useSlashMenu.ts` | **100%** | **92.1%** | **100%** | **100%** |
| `usePostEditor.ts` | **67.5%** | **90.3%** | **100%** | **67.5%** |

> `usePostEditor.ts` 미커버 lines(94-114, 118-146)는 ProseMirror 트랜잭션 의존 로직 → E2E 대상

### 테스트 구성

#### `normalizeHref.test.ts` (15개)

URL 정규화 순수 함수. **보안 케이스** 중심으로 작성.

| 케이스 | 검증 내용 |
|--------|---------|
| 허용 스킴 통과 | `https://`, `http://`, `mailto:`, `tel:` → 그대로 |
| **XSS 차단** | `javascript:`, `data:`, `vbscript:`, `ftp:` → `''` 반환 |
| 프로토콜 자동 추가 | `example.com` → `https://example.com` |
| 프로토콜-상대 URL | `//cdn.example.com` → 그대로 |
| 앵커 | `#section-1` → 그대로 |
| 빈 문자열 | `''` → `''` |

#### `useLinkPopup.test.ts` (9개)

링크 팝업 위치 상태 관리 훅.

| 케이스 | 검증 내용 |
|--------|---------|
| 초기 상태 | `pos === null` |
| `close()` | pos 리셋 |
| `openFromSlashMenu` (editor null) | pos 불변 |
| `openFromSlashMenu` (editor 있음) | 커서 `bottom + 8px` 위치 계산 |
| `handleEditorClick` (비링크) | pos 불변 |
| `handleEditorClick` (a[href] 직접 클릭) | 링크 `bottom + 8px` 위치 계산 |
| `handleEditorClick` (a[href] 내부 자식 클릭) | `closest`로 부모 링크 탐색 |

#### `useSlashMenu.test.ts` (15개)

슬래시 메뉴 필터링 · 키보드 네비게이션 훅.

| 케이스 | 검증 내용 |
|--------|---------|
| 빈 쿼리 | 모든 그룹 반환 |
| 쿼리 필터링 | label 포함 여부, 대소문자 무관 |
| 매칭 없음 | `onClose()` 자동 호출 |
| 그룹 offset 계산 | 첫 그룹 offset=0, 둘째 그룹 offset=첫 그룹 item 수 |
| ArrowDown | index 증가, 마지막→첫 wrap |
| ArrowUp | 첫→마지막 wrap |
| Enter | 현재 index item의 command 실행 + onClose |
| Escape | onClose 호출 |
| 쿼리 변경 시 index 리셋 | setSelectedIndex(0) 호출 |
| 쿼리 불변 시 index 유지 | 동일 쿼리 update는 index 변경 없음 |
| items=0일 때 키보드 무시 | early return 동작 검증 |
| nodeBefore=null | `null ?? ''` → 빈 쿼리로 처리 |

#### `usePostEditor.test.ts` (17개)

`useEditor` mock 방식으로 테스트 가능한 레이어만 커버. (`@tiptap/react` mock)

| 케이스 | 검증 내용 |
|--------|---------|
| **stale closure 방지** | `processFiles` 변경 후 최신 함수가 호출됨 |
| `handlePaste` (파일 있음) | processFiles 호출 + true 반환 |
| `handlePaste` (파일 없음 / clipboardData 없음) | false 반환 |
| `handleDrop` (파일 있음) | preventDefault + processFiles + true 반환 |
| `handleDrop` (파일 없음 / dataTransfer 없음) | false 반환 |
| 슬래시 메뉴 열림 + Enter/ArrowUp/ArrowDown | preventDefault + true 반환 (차단) |
| 슬래시 메뉴 닫힘 + Enter | 차단하지 않음 |
| `onUpdate` / 입력 | showSlashMenu = true |
| `onUpdate` 일반 텍스트 | showSlashMenu = false |
| `onUpdate` HTML 동기화 | setContent 호출 |
| `onSelectionUpdate` 커서 이탈 | 슬래시 메뉴 닫힘 |
| `onSelectionUpdate` 메뉴 닫힘 | 아무것도 하지 않음 |
| `closeSlashMenu` | showSlashMenu = false |

### 미커버 브랜치

| 파일 | 라인 | 내용 | 비고 |
|-----|------|------|------|
| `useSlashMenu.ts` | 79-80 | `el?.scrollIntoView` (el 존재할 때) | menuRef=null mock. 컴포넌트 통합 테스트에서 커버 가능 |
| `useSlashMenu.ts` | 86 | `getSlashQuery() ?? ''` null fallback | 실제 UX 상 도달 불가 경로 |
| `usePostEditor.ts` | 94-114 | 백틱 인라인 코드 변환 | ProseMirror 트랜잭션 의존 → E2E 대상 |
| `usePostEditor.ts` | 118-146 | Backspace 커스텀 동작 | ProseMirror 문서 구조 의존 → E2E 대상 |

---

## E2E (`e2e/specs/editor.spec.ts`)

**측정일**: 2026-06-25
**테스트 수**: 3개

| 시나리오 | 검증 내용 |
|----------|---------|
| 백틱 인라인 코드 | `foo` + `` ` `` 타이핑 → `<code>foo</code>` |
| Backspace 빈 heading | 빈 H1에서 Backspace → paragraph로 전환 |
| Backspace 리스트 재진입 방지 | 리스트 직후 빈 paragraph에서 Backspace → 리스트 진입 없이 삭제 |

> **전제조건**: `DEV_ACCESS_TOKEN` 설정 + 쓰기 가능한 게시판이 있는 클럽
> clubId는 `/club/select` 리다이렉트로 동적 추출 (별도 환경변수 불필요)

---

## 추가 예정 (단위)

| 파일 | 우선순위 | 비고 |
|------|---------|------|
| `IndentExtension.ts` | 중간 | Tab/Shift-Tab/Backspace 들여쓰기 로직 |
| `LinkInput.tsx` | 중간 | applyLink 분기 (빈 선택, 기존 링크 편집) |
