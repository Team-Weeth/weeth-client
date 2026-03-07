# Data Fetching

## Strategy by Feature

| Feature | Approach | Reason |
|---------|----------|--------|
| Board list / detail | RSC | Data included in initial HTML, SEO-friendly |
| Sign up / Login | Server Action | Form mutation, leverages React 19 `useActionState` |
| Attendance management | React Query | Real-time, syncs state between admin and general users |
| Admin dashboard | React Query | Heavy client interaction (filters, sorting, pagination) |
| Post create / edit / delete | Server Action | Mutation + cache revalidate |

## API Instance

All API calls must go through the shared instance in `lib/apis/`. Do not call `fetch` directly.

```ts
// lib/apis/instance.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { method: 'GET', ...options }),
  post: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: <T>(path: string, body: unknown, options?: RequestInit) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body), ...options }),
  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { method: 'DELETE', ...options }),
};
```

Domain-specific API functions are split into separate files and re-exported from `lib/apis/index.ts`.

```ts
// lib/apis/post.ts
import { api } from './instance';
import type { Post } from '@/types';

export const postApi = {
  getList: () => api.get<Post[]>('/posts'),
  getById: (id: number) => api.get<Post>(`/posts/${id}`),
  create: (body: CreatePostBody) => api.post<Post>('/posts', body),
  update: (id: number, body: UpdatePostBody) => api.put<Post>(`/posts/${id}`, body),
  delete: (id: number) => api.delete<void>(`/posts/${id}`),
};
```

## RSC (React Server Component)

Use for pages that need data on initial render, where SEO matters, or for read-only screens with no interaction.

```tsx
// app/(private)/(main)/board/page.tsx
import { postApi } from '@/lib/apis';

export default async function BoardPage() {
  // Fetch directly from the server
  const posts = await postApi.getList();

  return <PostList posts={posts} />;
}
```

- Use `async/await` directly in Page / Layout components
- Runs on the server without `'use client'`
- Call functions from `lib/apis/` directly

## Server Action

Use for form submissions, data mutations (Create / Update / Delete), and when cache revalidation is needed.

```ts
// lib/actions/post.ts
'use server';

import { revalidatePath } from 'next/cache';
import { postApi } from '@/lib/apis';

export async function createPostAction(formData: FormData) {
  const body = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
  };

  await postApi.create(body);
  // Invalidate cache
  revalidatePath('/board');
}

export async function deletePostAction(id: number) {
  await postApi.delete(id);
  revalidatePath('/board');
}
```

### React 19 useActionState

Use for form mutations such as login and sign-up.

```tsx
'use client';

import { useActionState } from 'react';
import { loginAction } from '@/lib/actions';

export function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, null);

  return (
    <form action={action}>
      <input name="email" type="email" />
      <input name="password" type="password" />
      {state?.error && <p className="text-state-error typo-caption1">{state.error}</p>}
      <Button type="submit" disabled={isPending}>
        {/* Logging in... */}
        {isPending ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
```

## React Query

Use for real-time data, heavy client interaction (filters / sorting / pagination), and state sync between admin and general users.

### useQuery (Read)

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '@/lib/apis';

export function AttendanceList() {
  const { data, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => attendanceApi.getList(),
  });

  // 로딩 중...
  if (isLoading) return <div>Loading...</div>;
  return <ul>{data?.map(item => <li key={item.id}>{item.name}</li>)}</ul>;
}
```

### useMutation (Write)

```tsx
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/lib/apis';

export function AttendanceActions() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (id: number) => attendanceApi.update(id),
    onSuccess: () => {
      // 캐시 갱신
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  // 출석 처리
  return <Button onClick={() => mutate(1)} disabled={isPending}>Mark Attendance</Button>;
}
```

### Query Key Convention

```ts
// 리소스 단위로 계층 구조 유지
// Maintain hierarchy by resource unit
['posts']                          // list
['posts', id]                      // single item
['attendance']                     // all attendance
['attendance', { cardinalNumber }] // with filter
```

## Summary

```
Read + SEO needed              → RSC (async page)
Form submission / mutation     → Server Action + useActionState
Real-time / heavy interaction  → React Query
Simple client UI state         → Zustand
```
