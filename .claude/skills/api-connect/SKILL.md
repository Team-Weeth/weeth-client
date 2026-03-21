---
name: api-connect
description: Fetches a Swagger/OpenAPI spec, lists endpoints, and generates TypeScript types + API functions + data fetching strategy (RSC / Server Action / React Query) following the Weeth lib/apis/ pattern. Use when the user provides a Swagger URL or says "API 연결", "API 붙여줘", "swagger 연결".
argument-hint: "<swagger-url> [endpoint filter keyword]"
---

# API Connect

Reads a Swagger/OpenAPI spec and auto-generates TypeScript types, API functions, and usage code (RSC / Server Action / React Query).

## Arguments

Receives a Swagger URL via `$ARGUMENTS`.

- `/api-connect https://api.example.com/v3/api-docs`
- `/api-connect https://api.example.com/v3/api-docs skill` ← filter by "skill" keyword
- `/api-connect` (prompts for URL if not provided)

---

## Workflow

### Step 1. Fetch Spec

Parse the URL from `$ARGUMENTS`. If no URL is provided, ask the user.

Fetch the OpenAPI JSON/YAML spec via WebFetch.

- Try `{swagger-url}` directly
- On failure, try `{base-url}/v3/api-docs`, `{base-url}/swagger.json`, `{base-url}/api-docs` in order

---

### Step 2. Display Endpoint List

Parse all paths from the spec and display them in a table:

```
# Available Endpoints

| # | Method | Path | Summary |
|---|--------|------|---------|
| 1 | GET    | /api/v4/skills | List skills |
| 2 | POST   | /api/v4/skills | Create skill |
| 3 | GET    | /api/v4/skills/{id} | Get skill by ID |
| 4 | PUT    | /api/v4/skills/{id} | Update skill |
| 5 | DELETE | /api/v4/skills/{id} | Delete skill |

Enter the endpoint numbers to generate (e.g. 1,2,3 or all):
```

If `$ARGUMENTS` includes a filter keyword, pre-filter to only show paths containing that keyword.

Wait for user input, then proceed to Step 3.

---

### Step 3. Analyze and Recommend Strategy

Auto-classify selected endpoints based on HTTP method and characteristics.

#### Classification Rules

**GET endpoints:**

| Condition | Strategy | Generated File |
|-----------|----------|----------------|
| Page initial data / SEO needed | **RSC** | Usage example only |
| User interaction / filter · pagination | **React Query** (`useQuery`) | `hooks/use{Domain}Query.ts` |
| Real-time updates needed | **React Query** (`useQuery`, staleTime: 0) | `hooks/use{Domain}Query.ts` |

**POST / PUT / PATCH / DELETE endpoints:**

| Condition | Strategy | Generated File |
|-----------|----------|----------------|
| Form submission / simple mutation | **Server Action** | `lib/actions/{domain}.ts` |
| Optimistic updates / complex client state | **React Query** (`useMutation`) | `hooks/use{Domain}Mutation.ts` |

#### Ask only when ambiguous

Only ask the user in these cases (do not ask for every endpoint):

- GET where "real-time requirement" is unclear
- Mutation where "form submit vs complex client logic" is indistinguishable

Example question:
```
GET /api/v4/skills — two approaches are possible:
  A) RSC — fetch once on the server at page load (better for SEO)
  B) React Query — dynamic client-side fetch with filters/pagination

Which approach do you plan to use? (A/B)
```

Once strategy is confirmed, output the recommendation table:

```
# Strategy Recommendation

| Endpoint | Strategy | Generated File |
|----------|----------|----------------|
| GET /api/v4/skills | React Query (useQuery) | hooks/useSkillQuery.ts |
| POST /api/v4/skills | Server Action | lib/actions/skill.ts |
| GET /api/v4/skills/{id} | RSC | usage example only |
| PUT /api/v4/skills/{id} | Server Action | lib/actions/skill.ts |
| DELETE /api/v4/skills/{id} | Server Action | lib/actions/skill.ts |

Proceed? (Y/n)
```

---

### Step 4. Determine Domain Name

Extract the domain from the selected endpoint paths.

- `/api/v4/skills` → `skill`
- `/api/v4/attendance/weekly` → `attendance`
- If paths are mixed, confirm the domain name with the user

---

### Step 5. Check Existing Files

**Inspect API instance signatures:**

Read `src/lib/apis/client.ts` and `src/lib/apis/server.ts` to confirm the actual method signatures.

| Instance | Based on | Query params | Return type |
|----------|----------|--------------|-------------|
| `apiClient` | axios | `{ params: Record<string, any> }` (axios config) | `AxiosResponse<T>` |
| `apiServer` | fetch | `{ params: Record<string, string \| number> }` (custom options) | `Promise<T>` (data returned directly) |

Use these signatures as the basis for Step 7 code generation. If the file structure or interface has changed, prefer what was read.

**Check if target files already exist:**

If a file exists, merge; otherwise create new.

```
src/lib/apis/{domain}.ts
src/types/{domain}.ts
src/lib/actions/{domain}.ts       ← if Server Action strategy
src/hooks/use{Domain}Query.ts     ← if React Query useQuery strategy
src/hooks/use{Domain}Mutation.ts  ← if React Query useMutation strategy
```

---

### Step 6. Generate TypeScript Types

**File location:** `src/types/{domain}.ts`

Extract schemas related to the selected endpoints from `components/schemas` in the spec.

**Conversion rules:**

| OpenAPI | TypeScript |
|---------|------------|
| `string` | `string` |
| `integer` / `number` | `number` |
| `boolean` | `boolean` |
| `array` of T | `T[]` |
| `object` with properties | `interface` |
| nullable field | `T \| null` |
| field not in required | `T?` (optional) |
| enum | `type X = 'A' \| 'B'` |

**Example:**
```ts
// src/types/skill.ts

export interface Skill {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface CreateSkillBody {
  name: string;
  description?: string;
}

export interface UpdateSkillBody {
  name?: string;
  description?: string;
}
```

**Rules:**
- If a response wrapper (`data`, `result`, etc.) exists, extract only the inner payload type
- Date/time fields are `string` (ISO 8601)
- Paginated responses reuse a common `Page<T>` type (create if not found)
- If schema is missing or `any`, use `unknown` and notify the user

---

### Step 7. Generate API Functions

**File location:** `src/lib/apis/{domain}.ts`

Use `apiClient` (axios, client-side) or `apiServer` (fetch, RSC/Server Action) based on strategy.

- React Query strategy → `apiClient`
- RSC / Server Action strategy → `apiServer`
- Mixed → import both

**Generate code based on the actual signatures read in Step 5.**

| Instance | get | post/put/patch | delete |
|----------|-----|----------------|--------|
| `apiClient` (axios) | `apiClient.get<T>(url, { params })` | `apiClient.post<T>(url, body)` | `apiClient.delete<T>(url)` |
| `apiServer` (fetch) | `apiServer.get<T>(path, { params })` | `apiServer.post<T>(path, body)` | `apiServer.delete<T>(path)` |

```ts
import { apiClient } from '@/lib/apis/client';
import { apiServer } from '@/lib/apis/server';
import type { Skill, CreateSkillBody, UpdateSkillBody } from '@/types/skill';

export const skillApi = {
  // For React Query (apiClient — axios, returns AxiosResponse<T>)
  getList: (params?: { page?: number; size?: number }) =>
    apiClient.get<Skill[]>('/api/v4/skills', { params }),

  // For RSC/Server Action (apiServer — fetch, returns T directly)
  getById: (id: number) =>
    apiServer.get<Skill>(`/api/v4/skills/${id}`),

  create: (body: CreateSkillBody) =>
    apiServer.post<Skill>('/api/v4/skills', body),

  update: (id: number, body: UpdateSkillBody) =>
    apiServer.put<Skill>(`/api/v4/skills/${id}`, body),

  delete: (id: number) =>
    apiServer.delete<void>(`/api/v4/skills/${id}`),
};
```

**Function naming rules:**

| HTTP + Pattern | Function name |
|----------------|---------------|
| GET /resources | `getList` |
| GET /resources/{id} | `getById` |
| GET /resources?filter=x | `getListBy{Filter}` |
| POST /resources | `create` |
| PUT /resources/{id} | `update` |
| PATCH /resources/{id} | `patch` |
| DELETE /resources/{id} | `delete` |
| POST /resources/{id}/action | `{action}` |

**Parameter rules:**
- Path parameter → function argument
- Query parameter → `params` object
- Request body → `body` argument

---

### Step 8. Generate Strategy-Specific Usage Code

Generate additional files based on strategy.

#### A. RSC (React Server Component)

No additional file. Output a usage example instead:

```tsx
// app/(private)/(main)/skills/page.tsx example
import { skillApi } from '@/lib/apis';

export default async function SkillsPage() {
  const skills = await skillApi.getById(1);
  return <div>{/* ... */}</div>;
}
```

#### B. Server Action

**File location:** `src/lib/actions/{domain}.ts`

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { skillApi } from '@/lib/apis';
import type { CreateSkillBody, UpdateSkillBody } from '@/types/skill';

export async function createSkill(body: CreateSkillBody) {
  const result = await skillApi.create(body);
  revalidatePath('/skills');
  return result;
}

export async function updateSkill(id: number, body: UpdateSkillBody) {
  const result = await skillApi.update(id, body);
  revalidatePath('/skills');
  return result;
}

export async function deleteSkill(id: number) {
  await skillApi.delete(id);
  revalidatePath('/skills');
}
```

**Rules:**
- `'use server'` directive required at the top of the file
- Must call `revalidatePath` or `revalidateTag` after every mutation
- `revalidatePath` path is an estimate — always ask user to confirm after generation

#### C. React Query — useQuery

**File location:** `src/hooks/use{Domain}Query.ts`

```ts
import { useQuery } from '@tanstack/react-query';
import { skillApi } from '@/lib/apis';
import type { Skill } from '@/types/skill';

export function useSkillList(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['skills', params],
    queryFn: () => skillApi.getList(params),
  });
}

export function useSkill(id: number) {
  return useQuery({
    queryKey: ['skills', id],
    queryFn: () => skillApi.getById(id),
  });
}
```

**staleTime rules:**

QueryProvider default is `5 minutes`, so omit `staleTime` unless there is a specific reason.

| Data characteristic | staleTime | Explicit |
|--------------------|-----------|---------|
| Default (list, single item, etc.) | default (5 min) | omit |
| Real-time (attendance, etc.) | `0` | required |
| Rarely changes (profile, etc.) | `30 * 60 * 1000` | required |

If uncertain, ask the user.

**Query key convention:**
```ts
['skills']                          // list
['skills', id]                      // single item
['skills', { page, size }]          // with filter
```

#### D. React Query — useMutation

**File location:** `src/hooks/use{Domain}Mutation.ts`

Declare `MutationCallbacks` as a shared type in `src/types/common.ts` and import it.

If not present in `src/types/common.ts`, add it:
```ts
// src/types/common.ts
export type MutationCallbacks<TError = Error> = {
  onSuccess?: () => void;
  onError?: (error: TError) => void;
  onMutate?: () => void;
  onSettled?: () => void;
};
```

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { skillApi } from '@/lib/apis';
import type { CreateSkillBody } from '@/types/skill';
import type { MutationCallbacks } from '@/types/common';

export function useCreateSkill(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSkillBody) => skillApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
    onMutate: () => {
      callbacks?.onMutate?.();
    },
    onSettled: () => {
      callbacks?.onSettled?.();
    },
  });
}

export function useDeleteSkill(callbacks?: MutationCallbacks) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => skillApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
    onSettled: () => {
      callbacks?.onSettled?.();
    },
  });
}
```

**`MutationCallbacks` rules:**
- Declare in `src/types/common.ts` — add if missing, import as-is if present
- Only implement needed callbacks — omit `onMutate`, `onSettled` if not used
- Always use optional chaining (`?.`)
- Always call `queryClient.invalidateQueries` before `callbacks?.onSuccess?.()`

---

### Step 9. Update index.ts

**1. `src/lib/apis/index.ts`** — add new domain API export (preserve existing exports):

```ts
export { skillApi } from './skill';
```

**2. `src/hooks/index.ts`** — add generated Query/Mutation hooks only if created (preserve existing exports):

```ts
// if useQuery hook was generated
export { useSkillList, useSkill } from './useSkillQuery';

// if useMutation hook was generated
export { useCreateSkill, useDeleteSkill } from './useSkillMutation';
```

Create `src/hooks/index.ts` if it does not exist.

---

### Step 10. Summary

```
✅ Generated files
  - src/types/skill.ts                   (Skill, CreateSkillBody, UpdateSkillBody)
  - src/lib/apis/skill.ts                (skillApi: getList, getById, create, update, delete)
  - src/lib/actions/skill.ts             (createSkill, updateSkill, deleteSkill)
  - src/hooks/useSkillQuery.ts           (useSkillList, useSkill)

✅ Updated files
  - src/lib/apis/index.ts                (added skillApi export)
  - src/hooks/index.ts                   (added useSkillList, useSkill export)

📋 Strategy per endpoint
  GET    /api/v4/skills          → useSkillList()       [React Query]
  GET    /api/v4/skills/{id}     → useSkill(id)         [React Query]
  POST   /api/v4/skills          → createSkill(body)    [Server Action]
  PUT    /api/v4/skills/{id}     → updateSkill(id,body) [Server Action]
  DELETE /api/v4/skills/{id}     → deleteSkill(id)      [Server Action]

⚠️  Action required
  - Please confirm the revalidatePath('/skills') path in lib/actions/skill.ts
```

---

## Notes

- If a response schema is missing or `any` → use `unknown` and notify the user
- Auth headers are handled automatically by `apiClient`/`apiServer` — do not add manually
- Notify the user if an endpoint uses `multipart/form-data` (file upload) — requires separate handling
- `revalidatePath` paths are estimates — always ask for confirmation after generation
- If staleTime is uncertain, do not set an arbitrary value — ask the user
