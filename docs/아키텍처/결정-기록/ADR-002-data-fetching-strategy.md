# ADR-002: 데이터 페칭 전략 (RSC / Server Action / React Query)

- **status**: accepted
- **date**: YYYY-MM-DD
- **참여자**: @미정
- **관련**: `.claude/rules/data-fetching.md`

## 맥락
Next.js 16 App Router에서 데이터 페칭 옵션이 다양하다 (RSC, Server Action, React Query, SWR, fetch 직접). 팀이 매번 고민하면 일관성이 깨지고 PR 리뷰가 길어진다.

## 결정
상황별로 도구를 못 박는다.

| 상황 | 도구 |
|------|------|
| 읽기 + SEO 필요 | **RSC** (`async` page/layout) |
| 폼 제출 / 변경 | **Server Action** + `useActionState` |
| 실시간 / 무거운 클라이언트 인터랙션 | **React Query** |
| 단순 클라이언트 UI 상태 | **Zustand** |

기능별 매핑:
- 게시판 목록/상세 → RSC
- 회원가입/로그인 → Server Action
- 출석 관리 → React Query
- 어드민 대시보드 → React Query
- 게시글 작성/수정/삭제 → Server Action

## 이유
- RSC: SEO 필요한 페이지에서 추가 클라이언트 번들 없이 데이터 가져옴.
- Server Action: 폼 처리 + 캐시 무효화(`revalidatePath`)가 한 함수에 묶임.
- React Query: 잦은 갱신, 낙관적 업데이트, 폴링이 필요한 인터랙션용.
- Zustand: 서버 상태가 아닌 UI 상태(모달, 토스트, 폼 임시값)는 전용 도구.

## 대안
- 모든 페이지에서 React Query → SEO 약함, 번들 늘어남.
- 모든 변경에서 React Query mutation → Server Action 캐시 무효화 이점 못 누림.

## 영향
- `lib/apis/` — 모든 API 호출은 여기 모음. `fetch` 직접 호출 금지.
- `lib/actions/` — Server Actions 모음 (`'use server'`).
- 클라이언트 훅은 `@/lib/apis` 배럴에서 가져오면 `next/headers` 임포트로 빌드 깨짐. **직접 경로**로 가져온다.
