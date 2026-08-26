# API 타입 사용법

> 백엔드 스펙에서 자동 생성된 타입을 쓰는 방법. 새 기능 개발 시 타입을 손으로 쓰지 않아도 된다.
> 왜 이 방식을 택했는지 → [[결정-기록/ADR-004-openapi-typescript]]

## 한 줄 요약

```ts
// Before: 손으로 씀
interface PostDetail { id: number; title: string; ... }

// After: 생성 타입에서 가져옴
import type { PostDetail } from '@/types/api/board';           // 일반 사용자 API
import type { AdminClubDetail } from '@/types/api/admin/club'; // 어드민 API
```

---

## Swagger 스펙 구분

| 스펙 | 대상 | 생성 파일 | 명령어 |
|------|------|-----------|--------|
| Public | 일반 사용자 API | `src/types/api.d.ts` | `pnpm generate:types` |
| Admin | 어드민 전용 API | `src/types/admin-api.d.ts` | `pnpm generate:types:admin` |

두 파일 모두 직접 수정하지 않는다. 각 명령어로만 갱신.

---

## 타입 재생성 (백엔드 스펙이 바뀌었을 때)

```bash
# 일반 사용자 API
pnpm generate:types

# 어드민 API
pnpm generate:types:admin
```

---

## 도메인별 import 경로

### 일반 사용자 API (`src/types/api/`)

| 도메인 | import 경로 |
|--------|-------------|
| 인증 (로그인·토큰) | `@/types/api/auth` |
| 유저·멀티프로필 | `@/types/api/user` |
| 동아리·멤버 | `@/types/api/club` |
| 게시판·게시글·댓글 | `@/types/api/board` |
| 출석 | `@/types/api/attendance` |
| 회비 | `@/types/api/account` |
| 일정·정기모임 | `@/types/api/schedule` |
| 파일 업로드 | `@/types/api/file` |
| 학교·학과 | `@/types/api/university` |
| 홈 대시보드 | `@/types/api/dashboard` |

### 어드민 API (`src/types/api/admin/`)

타입 이름에 `Admin` 접두사가 붙어 일반 API 타입과 충돌하지 않는다.

| 도메인 | import 경로 |
|--------|-------------|
| 동아리 설정 | `@/types/api/admin/club` |
| 멤버 관리 | `@/types/api/admin/member` |
| 게시판 관리 | `@/types/api/admin/board` |
| 세션 관리 | `@/types/api/admin/session` |
| 출석 관리 | `@/types/api/admin/attendance` |
| 일정 관리 | `@/types/api/admin/schedule` |
| 회비 관리 | `@/types/api/admin/account` |
| 기수 관리 | `@/types/api/admin/cardinal` |

---

## 실전 예시

### API 함수 작성

```ts
// lib/apis/board.ts
import type { PostDetail, CreatePostRequest, PostSaveResponse } from '@/types/api/board';

export const boardApi = {
  getPost: (clubId: string, boardId: number, postId: number) =>
    api.get<PostDetail>(`/clubs/${clubId}/boards/${boardId}/posts/${postId}`),

  createPost: (clubId: string, boardId: number, body: CreatePostRequest) =>
    api.post<PostSaveResponse>(`/clubs/${clubId}/boards/${boardId}/posts`, body),
};
```

```ts
// lib/apis/admin/board.ts (어드민)
import type { AdminBoardDetail, AdminCreateBoardRequest } from '@/types/api/admin/board';

export const adminBoardApi = {
  getBoard: (clubId: string, boardId: number) =>
    api.get<AdminBoardDetail>(`/admin/clubs/${clubId}/boards/${boardId}`),

  createBoard: (clubId: string, body: AdminCreateBoardRequest) =>
    api.post<AdminBoardDetail>(`/admin/clubs/${clubId}/boards`, body),
};
```

### React Query 훅

```ts
// hooks/queries/board/usePostQuery.ts
import type { PostDetail } from '@/types/api/board';
import { boardApi } from '@/lib/apis/board';

export function usePostQuery(clubId: string, boardId: number, postId: number) {
  return useSuspenseQuery<PostDetail>({
    queryKey: ['posts', clubId, boardId, postId],
    queryFn: () => boardApi.getPost(clubId, boardId, postId).then(res => res.data.data),
  });
}
```

### Server Action

```ts
// lib/actions/board.ts
'use server';

import type { CreatePostRequest } from '@/types/api/board';

export async function createPostAction(
  clubId: string,
  boardId: number,
  body: CreatePostRequest,
) {
  // ...
}
```

### Derived 타입 활용 (union 뽑기)

```ts
// 일반 API
import type { MemberRole, BoardType, AttendanceStatus } from '@/types/api/club';
// 'USER' | 'ADMIN' | 'LEAD'
// 'ALL' | 'NOTICE' | 'GENERAL'
// 'ATTEND' | 'PENDING' | 'ABSENT'

// 어드민 API
import type { AdminMemberRole, AdminBoardType, AdminAttendanceStatus } from '@/types/api/admin/member';
```

---

## 도메인 파일에 원하는 타입이 없을 때

**방법 1 — 도메인 파일에 추가** (권장)

```ts
// src/types/api/board.ts 에 추가
export type PostAuthor =
  S<'com.weeth.domain.board.application.dto.response.PostAuthorResponse'>;
```

> 스키마 키는 `src/types/api.d.ts` 안에서 `components['schemas']` 아래를 검색하면 찾을 수 있다.
> 어드민은 `src/types/admin-api.d.ts`에서 검색.

**방법 2 — 그냥 직접 접근**

```ts
// 일반 API
import type { components } from '@/types/api';
type SomethingNew = components['schemas']['com.weeth...SomethingNewResponse'];

// 어드민 API
import type { components } from '@/types/admin-api';
type AdminSomethingNew = components['schemas']['com.weeth...SomethingNewResponse'];
```

---

## 새 도메인이 생겼을 때

### 일반 API

1. `src/types/api/{domain}.ts` 파일 생성

```ts
import type { components } from '@/types/api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

export type NewDomainItem = S<'com.weeth.domain.newdomain...'>;
```

2. `src/types/api/index.ts` 에 barrel 추가

```ts
export type * from './{domain}';
```

### 어드민 API

1. `src/types/api/admin/{domain}.ts` 파일 생성

```ts
import type { components } from '@/types/admin-api';

type S<K extends keyof components['schemas']> = components['schemas'][K];

// 타입 이름에 Admin 접두사 필수
export type AdminNewDomainItem = S<'com.weeth.domain.newdomain...'>;
```

2. `src/types/api/admin/index.ts` 에 barrel 추가

```ts
export type * from './{domain}';
```

---

## 주의사항

- `src/types/api.d.ts`, `src/types/admin-api.d.ts` — **직접 수정하지 않는다**. 각 generate 명령어로만 갱신.
- 어드민 타입은 반드시 `Admin` 접두사를 붙인다 (일반 API 타입과 동시에 import할 때 충돌 방지).
- 기존 `@/types/board`, `@/types/user` 등 손으로 쓴 파일 — 그대로 사용 가능. 마이그레이션은 필요할 때.
- 클라이언트 컴포넌트/훅에서 API 함수 import 시 반드시 직접 경로로: `@/lib/apis/board` (배럴 `@/lib/apis` 금지 → [[결정-기록/README]] 참고)
