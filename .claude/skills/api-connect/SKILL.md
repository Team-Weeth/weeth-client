---
name: api-connect
description: Fetches a Swagger/OpenAPI spec, lists endpoints, and generates TypeScript types + API functions following the Weeth lib/apis/ pattern. Use when the user provides a Swagger URL or says "API 연결", "API 붙여줘", "swagger 연결".
argument-hint: "<swagger-url> [endpoint filter keyword]"
allowed-tools: WebFetch, Read, Write, Edit, Glob, Grep
---

# API Connect

Swagger/OpenAPI 스펙을 읽어 TypeScript 타입과 API 함수를 자동 생성합니다.

## Arguments

`$ARGUMENTS`로 Swagger URL을 받습니다.

- `/api-connect https://api.example.com/swagger/v3/api-docs`
- `/api-connect https://api.example.com/v3/api-docs skill` ← "skill" 키워드로 필터
- `/api-connect` (미입력 시 URL 요청)

## Workflow

### Step 1. 스펙 수집

`$ARGUMENTS`에서 URL을 파싱합니다. URL이 없으면 사용자에게 요청합니다.

WebFetch로 OpenAPI JSON/YAML 스펙을 가져옵니다.

- `{swagger-url}` 직접 시도
- 실패하면 `{base-url}/v3/api-docs`, `{base-url}/swagger.json`, `{base-url}/api-docs` 순으로 시도

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

### Step 3. 도메인 이름 결정

선택된 엔드포인트의 path에서 도메인을 추출합니다.

- `/api/v4/skills` → `skill`
- `/api/v4/attendance/weekly` → `attendance`
- 경로가 혼재하면 사용자에게 도메인명 확인

### Step 4. 기존 파일 확인

```
src/lib/apis/{domain}.ts  — 존재하면 병합, 없으면 신규 생성
src/types/{domain}.ts     — 존재하면 병합, 없으면 신규 생성
```

### Step 5. TypeScript 타입 생성

스펙의 `components/schemas`에서 선택된 엔드포인트와 관련된 스키마를 추출합니다.

**타입 파일 위치:** `src/types/{domain}.ts`

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

export type SkillListResponse = Skill[];
```

**규칙:**
- 응답 wrapper(`data`, `result` 등)가 있으면 내부 타입만 추출
- `Response` suffix 타입은 실제 data payload 타입
- 날짜/시간 필드는 `string` (ISO 8601)
- 페이지네이션 응답은 제네릭 `Page<T>` 공통 타입 활용 (이미 있으면 재사용)

### Step 6. API 함수 생성

**API 파일 위치:** `src/lib/apis/{domain}.ts`

**클라이언트 vs 서버 결정:**
- React Query와 함께 쓸 클라이언트 API → `apiClient` (axios)
- RSC/Server Action에서 쓸 서버 API → `apiServer` (fetch)
- 확실하지 않으면 사용자에게 확인

**파일 구조:**
```ts
import { apiClient } from '@/lib/apis/client';
// 또는
import { apiServer } from '@/lib/apis/server';
import type { Skill, CreateSkillBody, UpdateSkillBody } from '@/types/skill';

export const skillApi = {
  getList: () =>
    apiClient.get<Skill[]>('/api/v4/skills'),

  getById: (id: number) =>
    apiClient.get<Skill>(`/api/v4/skills/${id}`),

  create: (body: CreateSkillBody) =>
    apiClient.post<Skill>('/api/v4/skills', body),

  update: (id: number, body: UpdateSkillBody) =>
    apiClient.put<Skill>(`/api/v4/skills/${id}`, body),

  delete: (id: number) =>
    apiClient.delete<void>(`/api/v4/skills/${id}`),
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

**경로 파라미터:** path parameter는 함수 인자로, query parameter는 `params` 객체로

```ts
// Path param
getById: (id: number) => apiClient.get<Skill>(`/api/v4/skills/${id}`)

// Query params
getList: (params?: { page?: number; size?: number }) =>
  apiClient.get<Page<Skill>>('/api/v4/skills', { params })
```

### Step 7. index.ts 업데이트

`src/lib/apis/index.ts`에 새 export 추가:

```ts
export { skillApi } from './skill';
```

기존 export는 유지합니다.

### Step 8. 결과 요약

```
✅ 생성된 파일
  - src/types/skill.ts          (Skill, CreateSkillBody, UpdateSkillBody)
  - src/lib/apis/skill.ts       (skillApi: getList, getById, create, update, delete)

✅ 업데이트된 파일
  - src/lib/apis/index.ts       (skillApi export 추가)

📋 생성된 엔드포인트 (5개)
  GET    /api/v4/skills          → skillApi.getList()
  POST   /api/v4/skills          → skillApi.create(body)
  GET    /api/v4/skills/{id}     → skillApi.getById(id)
  PUT    /api/v4/skills/{id}     → skillApi.update(id, body)
  DELETE /api/v4/skills/{id}     → skillApi.delete(id)

💡 다음 단계
  - React Query: useQuery(['skills'], skillApi.getList)
  - Server Action: lib/actions/skill.ts 에서 skillApi 호출
```

## 주의사항

- 응답 스키마가 없거나 `any`인 경우 → `unknown` 사용 후 사용자에게 알림
- 인증 헤더는 `apiClient`/`apiServer` 인스턴스가 자동 처리 — 수동 추가 불필요
- `multipart/form-data`(파일 업로드) 엔드포인트는 별도 처리 필요하다고 알림
