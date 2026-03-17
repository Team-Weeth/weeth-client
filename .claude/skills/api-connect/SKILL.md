---
name: api-connect
description: Fetches a Swagger/OpenAPI spec, lists endpoints, and generates TypeScript types + API functions + data fetching strategy (RSC / Server Action / React Query) following the Weeth lib/apis/ pattern. Use when the user provides a Swagger URL or says "API 연결", "API 붙여줘", "swagger 연결".
argument-hint: "<swagger-url> [endpoint filter keyword]"
---

# API Connect

Swagger/OpenAPI 스펙을 읽어 TypeScript 타입, API 함수, 그리고 실제 사용 코드(RSC / Server Action / React Query)를 자동 생성합니다.

## Arguments

`$ARGUMENTS`로 Swagger URL을 받습니다.

- `/api-connect https://api.example.com/v3/api-docs`
- `/api-connect https://api.example.com/v3/api-docs skill` ← "skill" 키워드로 필터
- `/api-connect` (미입력 시 URL 요청)

---

## Workflow

### Step 1. 스펙 수집

`$ARGUMENTS`에서 URL을 파싱합니다. URL이 없으면 사용자에게 요청합니다.

WebFetch로 OpenAPI JSON/YAML 스펙을 가져옵니다.

- `{swagger-url}` 직접 시도
- 실패하면 `{base-url}/v3/api-docs`, `{base-url}/swagger.json`, `{base-url}/api-docs` 순으로 시도

---

### Step 2. 엔드포인트 목록 표시

스펙에서 모든 paths를 파싱해 아래 표로 출력합니다:

```
# 사용 가능한 엔드포인트

| # | Method | Path | Summary |
|---|--------|------|---------|
| 1 | GET    | /api/v4/skills | 스킬 목록 조회 |
| 2 | POST   | /api/v4/skills | 스킬 생성 |
| 3 | GET    | /api/v4/skills/{id} | 스킬 단건 조회 |
| 4 | PUT    | /api/v4/skills/{id} | 스킬 수정 |
| 5 | DELETE | /api/v4/skills/{id} | 스킬 삭제 |

생성할 엔드포인트 번호를 입력하세요 (예: 1,2,3 또는 all):
```

`$ARGUMENTS`에 필터 키워드가 있으면 해당 키워드를 포함한 path만 사전 필터링해서 보여줍니다.

사용자 응답을 기다립니다. 응답이 오면 Step 3으로 진행합니다.

---

### Step 3. 전략 분석 및 추천

선택된 엔드포인트를 HTTP 메서드와 특성에 따라 자동 분류합니다.

#### 분류 규칙

**GET 엔드포인트:**

| 조건 | 전략 | 생성 파일 |
|------|------|-----------|
| 페이지 초기 데이터 / SEO 필요 | **RSC** | 사용 예시 코드만 제공 |
| 사용자 인터랙션 / 필터·페이지네이션 | **React Query** (`useQuery`) | `hooks/use{Domain}Query.ts` |
| 실시간 업데이트 필요 | **React Query** (`useQuery`, staleTime: 0) | `hooks/use{Domain}Query.ts` |

**POST / PUT / PATCH / DELETE 엔드포인트:**

| 조건 | 전략 | 생성 파일 |
|------|------|-----------|
| 폼 제출 / 단순 mutation | **Server Action** | `lib/actions/{domain}.ts` |
| 낙관적 업데이트 / 복잡한 클라이언트 상태 | **React Query** (`useMutation`) | `hooks/use{Domain}Mutation.ts` |

#### 판단이 애매한 경우에만 질문

아래 경우에만 사용자에게 확인합니다 (모든 엔드포인트에 질문하지 않음):

- GET인데 "실시간 필요 여부"가 불명확한 경우
- mutation인데 "폼 제출 vs 복잡한 클라이언트 로직" 구분이 안 되는 경우

예시 질문:
```
GET /api/v4/skills — 두 가지 방식이 가능합니다:
  A) RSC — 페이지 로딩 시 서버에서 한 번 fetch (SEO 유리)
  B) React Query — 클라이언트에서 필터/페이지네이션 등 동적 fetch

어떤 방식으로 사용할 예정인가요? (A/B)
```

전략이 확정되면 추천 결과를 표로 출력합니다:

```
# 전략 추천 결과

| 엔드포인트 | 전략 | 생성 파일 |
|-----------|------|-----------|
| GET /api/v4/skills | React Query (useQuery) | hooks/useSkillQuery.ts |
| POST /api/v4/skills | Server Action | lib/actions/skill.ts |
| GET /api/v4/skills/{id} | RSC | 사용 예시만 제공 |
| PUT /api/v4/skills/{id} | Server Action | lib/actions/skill.ts |
| DELETE /api/v4/skills/{id} | Server Action | lib/actions/skill.ts |

계속 진행할까요? (Y/n)
```

---

### Step 4. 도메인 이름 결정

선택된 엔드포인트의 path에서 도메인을 추출합니다.

- `/api/v4/skills` → `skill`
- `/api/v4/attendance/weekly` → `attendance`
- 경로가 혼재하면 사용자에게 도메인명 확인

---

### Step 5. 기존 파일 확인

아래 파일 존재 여부를 확인합니다. 존재하면 병합, 없으면 신규 생성합니다.

```
src/lib/apis/{domain}.ts
src/types/{domain}.ts
src/lib/actions/{domain}.ts       ← Server Action 전략인 경우
src/hooks/use{Domain}Query.ts     ← React Query useQuery 전략인 경우
src/hooks/use{Domain}Mutation.ts  ← React Query useMutation 전략인 경우
```

---

### Step 6. TypeScript 타입 생성

**파일 위치:** `src/types/{domain}.ts`

스펙의 `components/schemas`에서 선택된 엔드포인트와 관련된 스키마를 추출합니다.

**변환 규칙:**

| OpenAPI | TypeScript |
|---------|-----------|
| `string` | `string` |
| `integer` / `number` | `number` |
| `boolean` | `boolean` |
| `array` of T | `T[]` |
| `object` with properties | `interface` |
| nullable field | `T \| null` |
| required 미포함 field | `T?` (optional) |
| enum | `type X = 'A' \| 'B'` |

**예시:**
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

**규칙:**
- 응답 wrapper(`data`, `result` 등)가 있으면 내부 payload 타입만 추출
- 날짜/시간 필드는 `string` (ISO 8601)
- 페이지네이션 응답은 공통 `Page<T>` 타입 재사용 (없으면 생성)
- 스키마가 없거나 `any`이면 `unknown`으로 처리하고 사용자에게 알림

---

### Step 7. API 함수 생성

**파일 위치:** `src/lib/apis/{domain}.ts`

전략에 따라 `apiClient`(axios, 클라이언트) 또는 `apiServer`(fetch, RSC/Server Action)를 사용합니다.

- React Query 전략 → `apiClient`
- RSC / Server Action 전략 → `apiServer`
- 혼재하는 경우 → 각각 import

```ts
import { apiClient } from '@/lib/apis/client';
import { apiServer } from '@/lib/apis/server';
import type { Skill, CreateSkillBody, UpdateSkillBody } from '@/types/skill';

export const skillApi = {
  // React Query용 (apiClient)
  getList: (params?: { page?: number; size?: number }) =>
    apiClient.get<Skill[]>('/api/v4/skills', { params }),

  // RSC/Server Action용 (apiServer)
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

**함수명 규칙:**

| HTTP + 패턴 | 함수명 |
|-------------|--------|
| GET /resources | `getList` |
| GET /resources/{id} | `getById` |
| GET /resources?filter=x | `getListBy{Filter}` |
| POST /resources | `create` |
| PUT /resources/{id} | `update` |
| PATCH /resources/{id} | `patch` |
| DELETE /resources/{id} | `delete` |
| POST /resources/{id}/action | `{action}` |

**파라미터 규칙:**
- Path parameter → 함수 인자
- Query parameter → `params` 객체
- Request body → `body` 인자

---

### Step 8. 전략별 사용 코드 생성

전략에 따라 아래 파일을 추가로 생성합니다.

#### A. RSC (React Server Component)

별도 파일 생성 없이, 사용 예시 코드를 출력합니다:

```tsx
// app/(private)/(main)/skills/page.tsx 예시
import { skillApi } from '@/lib/apis';

export default async function SkillsPage() {
  const skills = await skillApi.getById(1);
  return <div>{/* ... */}</div>;
}
```

#### B. Server Action

**파일 위치:** `src/lib/actions/{domain}.ts`

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

**규칙:**
- 파일 최상단에 `'use server'` 필수
- mutation 후 반드시 `revalidatePath` 또는 `revalidateTag` 호출
- `revalidatePath` 경로는 추정값으로 생성 후 사용자에게 확인 요청

#### C. React Query — useQuery

**파일 위치:** `src/hooks/use{Domain}Query.ts`

```ts
import { useQuery } from '@tanstack/react-query';
import { skillApi } from '@/lib/apis';
import type { Skill } from '@/types/skill';

export function useSkillList(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['skills', params],
    queryFn: () => skillApi.getList(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSkill(id: number) {
  return useQuery({
    queryKey: ['skills', id],
    queryFn: () => skillApi.getById(id),
    staleTime: 5 * 60 * 1000,
  });
}
```

**staleTime 규칙** (불확실하면 사용자에게 확인):

| 데이터 특성 | staleTime | gcTime |
|------------|-----------|--------|
| 실시간 (출석 등) | `0` | `5 * 60 * 1000` |
| 중간 빈도 (목록 등) | `5 * 60 * 1000` | `10 * 60 * 1000` |
| 거의 안 바뀜 (프로필 등) | `30 * 60 * 1000` | `60 * 60 * 1000` |

**쿼리 키 컨벤션:**
```ts
['skills']                          // 목록
['skills', id]                      // 단건
['skills', { page, size }]          // 필터 포함
```

#### D. React Query — useMutation

**파일 위치:** `src/hooks/use{Domain}Mutation.ts`

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { skillApi } from '@/lib/apis';
import type { CreateSkillBody } from '@/types/skill';

export function useCreateSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSkillBody) => skillApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => skillApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
}
```

---

### Step 9. index.ts 업데이트

`src/lib/apis/index.ts`에 새 export 추가 (기존 export 유지):

```ts
export { skillApi } from './skill';
```

---

### Step 10. 결과 요약

```
✅ 생성된 파일
  - src/types/skill.ts                   (Skill, CreateSkillBody, UpdateSkillBody)
  - src/lib/apis/skill.ts                (skillApi: getList, getById, create, update, delete)
  - src/lib/actions/skill.ts             (createSkill, updateSkill, deleteSkill)
  - src/hooks/useSkillQuery.ts           (useSkillList, useSkill)

✅ 업데이트된 파일
  - src/lib/apis/index.ts                (skillApi export 추가)

📋 엔드포인트별 전략
  GET    /api/v4/skills          → useSkillList()       [React Query]
  GET    /api/v4/skills/{id}     → useSkill(id)         [React Query]
  POST   /api/v4/skills          → createSkill(body)    [Server Action]
  PUT    /api/v4/skills/{id}     → updateSkill(id,body) [Server Action]
  DELETE /api/v4/skills/{id}     → deleteSkill(id)      [Server Action]

⚠️  확인 필요
  - lib/actions/skill.ts의 revalidatePath('/skills') 경로가 맞는지 확인해 주세요
```

---

## 주의사항

- 응답 스키마가 없거나 `any`인 경우 → `unknown` 사용 후 사용자에게 알림
- 인증 헤더는 `apiClient`/`apiServer` 인스턴스가 자동 처리 — 수동 추가 불필요
- `multipart/form-data` (파일 업로드) 엔드포인트는 별도 처리 필요하다고 알림
- `revalidatePath` 경로는 추정값이므로 생성 후 반드시 확인 요청
- staleTime이 불확실한 경우 임의로 설정하지 말고 사용자에게 확인
