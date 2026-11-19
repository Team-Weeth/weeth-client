# Weeth Analytics 계측 핸드오프 — WTH-62 / 63 / 64

> 이 문서 하나로 **컨텍스트 없는 새 세션**이 이어받아 작업할 수 있도록 정리한 핸드오프입니다.
> 작성: 2026-11-19. 대상 레포: `weeth-client` (Next.js 16 App Router, React 19, TS, pnpm).

---

## 0. 현재 상태 (어디까지 됐나)

- **WTH-61 완료** — 커스텀 이벤트 추적을 PostHog → GA4(`@next/third-parties/google`)로 이관 + 타입 세이프 analytics 헬퍼 신설.
  - 브랜치 `WTH-61-analytics-타입세이프-헬퍼`, 커밋 `6d4f90ff`, **PR [#249](https://github.com/Team-Weeth/weeth-client/pull/249) → `develop`** (아직 미머지).
  - 이게 62/63/64의 **베이스**이자 의존(②). 여기서 만든 헬퍼 위에 계측을 올린다.
- **WTH-62 / 63 / 64 미착수** — 브랜치 없음. 이 문서의 가이드대로 진행.
- 상위 이슈: [WTH-59](https://linear.app/weeth/issue/WTH-59). 자식: [WTH-62](https://linear.app/weeth/issue/WTH-62)(가입)·[WTH-63](https://linear.app/weeth/issue/WTH-63)(게시판)·[WTH-64](https://linear.app/weeth/issue/WTH-64)(출석·마이페이지).

---

## 1. Analytics 인프라 (먼저 숙지 — 새로 만들지 말 것)

| 파일                                  | 역할                                                                                                                                                                                                                   |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/analytics/ga.ts`             | 유일한 `sendGAEvent` 호출부. `trackGA<Name>(name, params)` + `setAnalyticsUser({ userId, properties })`. **프로덕션(`NEXT_PUBLIC_APP_ENV==='production'`) + 브라우저**에서만 발화, 그 외 no-op → 무조건 호출해도 안전. |
| `src/lib/analytics/events.ts`         | `AnalyticsEventParams` 타입 맵 = **이벤트명→파라미터 단일 소스**. 새 이벤트는 반드시 여기 먼저 추가(파일 L9 주석이 각 WTH에서 추가하라고 명시).                                                                        |
| `src/lib/analytics/feedbackEvents.ts` | **도메인 이벤트 모듈 템플릿.** `trackGA`를 감싼 `trackXxx()` 네임드 함수들. 새 도메인은 이걸 복사해서 만든다.                                                                                                          |
| `src/tours/analytics.ts`              | 또 다른 참고 예시(투어 이벤트).                                                                                                                                                                                        |

**규칙**

- GA4 param 값은 **primitive(string/number/boolean/null)만**. 객체/배열 금지.
- **PII 금지** — 이메일·이름·전화 등 보내지 말 것. `club_id`·id·불린·길이 정도만.
- import: 네임드 + `@/` alias (`import { trackGA } from '@/lib/analytics/ga';`). 상대경로(`../`) 금지, 배럴(`@/lib/apis`) 금지.
- 컴포넌트는 상태/이벤트핸들러 쓸 때만 `'use client'`. 훅 파일은 지시어 없어도 클라에서만 소비되면 OK.
- 커밋: `[type]: 한글 요약` + WTH id. 브랜치는 직접 생성(`WTH-62-...` 식, 소문자 `wth-62`도 Linear 자동 링크됨).

### 도메인 모듈 만드는 법 (feedbackEvents.ts 패턴)

```ts
// src/lib/analytics/boardEvents.ts (예)
import { trackGA } from '@/lib/analytics/ga';

export function trackPostCreate(params: { club_id: string; board_id: number; board_type: string }) {
  trackGA('post_create', params);
}
```

그리고 `events.ts`의 `AnalyticsEventParams`에 `post_create: { club_id: string; board_id: number; board_type: string }` 같은 키를 추가.

---

## 2. 작업 / PR 전략

- **스택 PR 권장**: `develop ← WTH-61 ← WTH-62 ← WTH-63 ← WTH-64` (아래 PR이 위 PR을 base로).
  - 이유: 62/63/64가 **전부 `events.ts`를 수정** → 독립 분기하면 그 파일에서 충돌. 직렬 스택이면 충돌 없음. 머지도 61→62→63→64 순.
  - 각자 `develop`에서 분기하고 충돌을 수동 해결하는 방식도 가능(선택).
- PR base를 **명시**(`--base <이전 브랜치>`). PR 본문은 `.github/pull_request_template.md` 따르고, 없는 항목은 "없음".
- 검증(각 이슈): `pnpm typecheck` · `pnpm lint` · 해당 `pnpm exec jest --runInBand --runTestsByPath <test>`. PR 핸드오프 전엔 `pnpm build`까지.

---

## 3. WTH-62 — 가입 퍼널 계측

**이벤트:** `sign_up_start` · `sign_up_submit` · `sign_up_complete`(주요 이벤트) · `login`(주요 이벤트)

**아키텍처 (중요):** 소셜 OAuth(카카오/애플) **전용**. 이메일/비번 폼 없음 — 가입 "폼" = 약관 동의 모달. 백엔드 `registered` 불린으로 로그인(기존)/가입(신규) 구분.
플로우: `/login` → 카카오/애플 클릭 → **서버 route** `src/app/(public)/{kakao,apple}/oauth/route.ts`에서 code 교환·`registered` 확인 → `true`면 로그인 리다이렉트 / `false`면 `/login?terms=true`로 약관 모달 → `agreeTermsAction`(서버액션) → 가입 완료.

> ⚠️ **핵심 블로커:** `login`·`sign_up_complete` 성공이 전부 **서버 redirect로** 결정됨. 클라 성공 콜백이 없어 **소규모 리팩터 필요** — "한 줄 추가"로 안 끝난다.

**0. 공통** — `events.ts`에 4개 키 추가 → `src/lib/analytics/authEvents.ts` 신설.

| 이벤트             | 위치                                                            | 메커니즘 / 비고                                                                                                                                                                                                                                                                    |
| ------------------ | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sign_up_start`    | `src/components/auth/LoginPageClient.tsx` (`'use client'`) ~L36 | `defaultTermsOpen`(신규 유저만 `terms=true`)일 때 `useEffect` 1회. params: `intent`, `club_id`(초대 플로우 시).                                                                                                                                                                    |
| `sign_up_submit`   | 같은 파일 L101, `onAgree`에서 `agreeTermsAction(...)` **직전**  | params: `intent`, `club_id`.                                                                                                                                                                                                                                                       |
| `sign_up_complete` | 🔧 리팩터 후 `onAgree`                                          | `src/lib/actions/auth.ts` L50 `agreeTermsAction`을 `redirect()` 대신 **`{ success, redirectUrl }` 반환**으로 변경(이미 `src/lib/actions/club.ts:48` `createClubAction`이 이 패턴 — 참고/복사). 그 후 `onAgree`에서 `result.success`일 때 발화 + `router.push(result.redirectUrl)`. |
| `login`            | 🔧 시그널 추가 후 `AuthStoreInitializer.tsx` L12 useEffect      | OAuth route(kakao `route.ts:79~`, apple `:86~`)만 `registered`를 앎 → `auth_event=login                                                                                                                                                                                            | signup`쿠키를 기존`userName`쿠키와 함께 발행 →`src/app/(private)/(auth)/layout.tsx`가 읽어 `AuthStoreInitializer`에 전달 → `login`발화 +`setAnalyticsUser({ userId })`. provider는 route 파일(kakao/apple)로 구분 → `method` param. |

**참고:** 클럽 생성(`createClubAction`→`ClubCreatingPage:58`)·가입(`JoinClubForm` 현재 stub) 퍼널은 이 4개와 **별개**. 나중에 클럽 퍼널 원하면 `ClubCreatingPage` 성공 콜백이 깔끔.

---

## 4. WTH-63 — 게시판 행동 계측

**이벤트:** `post_create` · `comment_create` · `post_view` · `board_search` · `author_profile_open`

> ⚠️ **블로커 2개 먼저 결정**: `board_search`는 **기능 미존재**, `author_profile_open`은 **의존 커밋(f8959060)이 현재 브랜치에 없음**. 4·5번 참고.

**0. 공통** — `events.ts`에 이벤트 추가 → `src/lib/analytics/boardEvents.ts` 신설.

1. **`post_create`** — `src/hooks/board/useCreatePost.ts:36` 내 `onSuccess`. 서버액션(`src/lib/actions/board.ts:30`). params: post id(`result.id`), board id(`result.boardId`), `club_id`(`useClubId()`). 게시판 종류는 `useBoardTypeMap()[boardId]`(`@/stores/useBoardNavStore`).
2. **`comment_create`** — `src/hooks/board/useCreateComment.ts:31`(`mutateAsync` 성공 후, `return true` 전). RQ mutation(`commentApi.create`, `src/lib/apis/comment.ts:7`). params: `boardId`, `postId`, `parentCommentId`(있으면 답글 → `is_reply`). ⚠️ 공유 훅 `useCommentMutation`에선 발화 금지(수정/삭제에도 오발).
3. **`post_view`** — 상세는 **RSC**. 클라 경계 `src/app/(private)/[clubId]/(main)/board/(with-nav)/[boardId]/[postId]/PostDetailContent.tsx`(`'use client'`)에 `currentPost.id` 가드 `useEffect`(기존 effect들이 L79~97). params: boardId, postId, `club_id`, board 종류(`boardTypeMap[currentPost.boardId]`).
4. ⚠️ **`board_search`** — **기능 없음.** 사용자 게시판(`src/components/board/`, board route)에 검색 UI/엔드포인트 미존재. 검색은 **어드민 게시판**(`src/components/admin/board/BoardToolbar.tsx`)만 있고 별개 기능. → **기능이 생기면 계측하거나, WTH-63 범위에서 제외 결정** 필요. (팀 확인 필요)
5. ⚠️ **`author_profile_open`** — 의존 커밋 **`f8959060`가 현재 브랜치에 없음**(diverged, `git merge-base --is-ancestor` 실패). 그 커밋은 포스트/댓글 작성자 클릭 시 `MemberDetailModal`(`src/components/member/MemberDetailModal.tsx`)을 염. 현재 브랜치는 댓글을 `CommentSection.tsx`(dynamic import, `ssr:false`)로 분리 리팩터해 작성자 클릭 플럼빙이 다름. → **f8959060 머지 후**, `setSelectedAuthorId(authorId)` 호출부(모달 오픈 전환)에서 1회 발화(상태 소유 컴포넌트 = `PostDetailContent.tsx` 또는 `CommentSection.tsx`). params: target author id, `club_id`, boardId, postId. 중복 집계 피하려면 단일 setter 또는 `useEffect(selectedAuthorId !== null)`에서.

---

## 5. WTH-64 — 출석·마이페이지 계측

**이벤트:** `attendance_check`(주요 이벤트) · `attendance_fail` · `profile_edit`

**0. 공통** — `events.ts`에 3개 추가 → `src/lib/analytics/attendanceEvents.ts`(+프로필) 신설.

1. **`attendance_check`** (성공) — `src/hooks/attendance/useCheckIn.ts` **try 성공 직후(L71, `setCheckedSessionId(sessionId)` 옆)**. ⚠️ **useMutation 아님** — plain `async/await` + `try/catch`. 훅이 `AttendanceContent.tsx`·`TodayScheduleBox.tsx` 둘 다 커버. params: `club_id`(`clubId`), `session_id`(`sessionId`)(, 입력 code).
2. **`attendance_fail`** (실패) — 같은 파일 `catch`(L57~69), `const errorCode = getApiErrorCode(error)`(L58) **뒤, `return`(L68) 전**. 사유 param = 숫자 `error_code`. 코드 정의 `src/constants/attendance/error.ts`: `CODE_MISMATCH 20201`(오답), `QR_EXPIRED 20203`(만료), `NOT_FOUND 20200`, `ALREADY_ATTENDED 20204`. 권장: `{ error_code: errorCode ?? null }`(+선택 `error_message`). HTTP status는 `error.response?.status`.
3. **`profile_edit`** (성공) — `src/components/mypage/edit/EditProfileContent.tsx:106`, `onSuccess` 첫 줄(`toastSuccess('프로필이 수정되었습니다.')` 옆). RQ `useUpdateProfileMutation`. params: **`club_id`만**(수정 필드는 name/email/tel/학번 등 **PII라 금지**).

**결정 필요:** 기수(generation) number는 출석·프로필 **어느 지점에도 scope에 없음**. 필요하면 `useSelectedCardinalStore`/`useProfileStatusQuery`에서 끌어와야 함(현재 `useCheckIn.ts` 미import).

---

## 6. 공통 체크리스트 (각 이슈 작업 시)

1. `src/lib/analytics/events.ts`에 이벤트 키 추가(타입부터).
2. 도메인 모듈(`authEvents`/`boardEvents`/`attendanceEvents`) 생성 — `feedbackEvents.ts` 패턴.
3. 위 표의 위치에 발화 호출 삽입(PII·non-primitive 주의).
4. 테스트: 도메인 모듈 단위 테스트(`feedbackEvents.test.ts` 참고 — `jest.mock('@/lib/analytics/ga')` 후 매핑 검증).
5. `pnpm typecheck` · `pnpm lint` · 해당 jest.
6. 커밋(`[feat]: ... WTH-6x`) → push → PR(base = 스택 상 이전 브랜치).

## 관련 링크

- 베이스 PR: https://github.com/Team-Weeth/weeth-client/pull/249
- 규칙: `AGENTS.md`, `.claude/rules/data-fetching.md`(RSC/서버액션/RQ), `.claude/rules/architecture.md`(배럴 금지), `.claude/rules/testing.md`.
