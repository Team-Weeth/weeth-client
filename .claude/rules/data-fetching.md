# Data Fetching

## Strategy

| Situation | Approach |
|-----------|----------|
| Read + SEO needed | RSC (`async` page/layout) |
| Form submission / mutation | Server Action + `useActionState` |
| Real-time / heavy client interaction | React Query |
| Simple client UI state | Zustand |

### Feature mapping

| Feature | Approach |
|---------|----------|
| Board list / detail | RSC |
| Sign up / Login | Server Action |
| Attendance management | React Query |
| Admin dashboard | React Query |
| Post create / edit / delete | Server Action |

## API Instance

All API calls must go through `lib/apis/`. Do not call `fetch` directly.

- Shared instance: `lib/apis/instance.ts` — wraps `fetch`, handles error and 204
- Domain APIs: `lib/apis/{domain}.ts` — use the instance, re-export from `lib/apis/index.ts`

```ts
// lib/apis/post.ts
export const postApi = {
  getList: () => api.get<Post[]>('/posts'),
  getById: (id: number) => api.get<Post>(`/posts/${id}`),
  create: (body: CreatePostBody) => api.post<Post>('/posts', body),
  update: (id: number, body: UpdatePostBody) => api.put<Post>(`/posts/${id}`, body),
  delete: (id: number) => api.delete<void>(`/posts/${id}`),
};
```

## Rules

### RSC
- Use `async/await` directly in Page / Layout — no `'use client'`
- Call `lib/apis/` functions directly

### Server Action
- `'use server'` at top of file, located in `lib/actions/`
- Call `revalidatePath` / `revalidateTag` after mutation

### React Query — Query Key Convention

```ts
['posts']                          // list
['posts', id]                      // single item
['attendance', { generationNumber }] // with filter
```

### React Query — Suspense Pattern (preferred)

When the same query's loading/error handling is duplicated across 2+ components, use `useSuspenseQuery` + Next.js `loading.tsx` / `error.tsx` instead of manual `isLoading` / `isError` checks.

```ts
// hooks/queries/mypage/useMyMemberQuery.ts
import { useSuspenseQuery, skipToken } from '@tanstack/react-query';

export function useMyMemberQuery() {
  const clubId = useClubId();
  return useSuspenseQuery({
    queryKey: ['mypage', 'me', clubId],
    queryFn: clubId
      ? () => mypageApi.getMe(clubId).then((res) => res.data.data)
      : skipToken,
  });
}
```

- `useSuspenseQuery`: `data` is always defined (no `isLoading` / `isError` / `!data` guards needed)
- `skipToken`: replaces `enabled` option (not supported by `useSuspenseQuery`)
- `loading.tsx`: placed in the route segment, handles Suspense fallback
- `error.tsx`: placed in the route segment, handles ErrorBoundary with `reset` prop

```tsx
// app/(private)/(main)/mypage/loading.tsx
export default function Loading() {
  return <p>로딩 중...</p>;
}

// app/(private)/(main)/mypage/error.tsx
'use client';
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <Button onClick={reset}>다시 시도</Button>;
}
```

**When to use:** Client components that fetch user-scoped data shown on page load (e.g., my profile, my clubs).
**When NOT to use:** Queries triggered by user interaction (e.g., search, infinite scroll) — use regular `useQuery` for those.

### Import Rule — Barrel Export Caveat

Client-side hooks must **NOT** import from `@/lib/apis` (barrel). The barrel re-exports `apiServer` which imports `next/headers`, causing build errors in client components. Always use direct imports:

```ts
// Good
import { mypageApi } from '@/lib/apis/mypage';

// Bad — pulls in apiServer → next/headers
import { mypageApi } from '@/lib/apis';
```
