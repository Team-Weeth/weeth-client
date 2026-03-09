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
['attendance', { cardinalNumber }] // with filter
```
