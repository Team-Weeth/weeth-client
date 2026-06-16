---
name: write-tests
description: "Writes Jest + React Testing Library tests for components, hooks, and pages. Supports unit tests and integration tests with MSW."
argument-hint: "[file path | --suggest] [--integration]"
disable-model-invocation: true
allowed-tools: Glob, Grep, Read, Bash, Write, Edit
---

# 테스트 작성

대상 파일을 분석하여 Jest + React Testing Library 테스트를 작성합니다.

전략, 규칙, 파일 위치 컨벤션은 `.claude/rules/testing.md`를 참고하세요.

## 인수

- `/write-tests src/components/ui/Button.tsx` — 단위 테스트
- `/write-tests src/hooks/useAutoScroll.ts` — 훅 테스트
- `/write-tests src/components/board/PostList.tsx --integration` — MSW 통합 테스트
- `/write-tests --suggest` — 현재 브랜치 변경 파일을 분석해 테스트 작성 대상 추천
- `/write-tests` (생략 시 IDE에서 현재 열린 파일을 대상으로 하거나 사용자에게 질문)

## 워크플로 (순서대로 따르세요)

### 1. 대상 파일 확인

| 조건 | 동작 |
|------|------|
| `$ARGUMENTS`가 `--suggest` | **[추천 모드]** 로 이동 |
| `$ARGUMENTS`가 파일 경로 | 해당 파일로 2단계 진행 |
| `$ARGUMENTS` 없음 | **[추천 모드]** 로 이동 (자동) |

---

## [추천 모드] `--suggest`

### S1. 브랜치 변경 파일 수집

```bash
git diff main...HEAD --name-only --diff-filter=AM
```

결과에서 아래 항목을 **제외**한다:

| 제외 패턴 | 이유 |
|-----------|------|
| `*.d.ts` | 타입 선언만 있음 |
| `**/index.ts` | 배럴 export |
| `src/types/**` | 타입 전용 |
| `src/constants/**` | 상수 전용 |
| `src/assets/**` | 에셋 |
| `src/mocks/**` | 테스트 픽스처 자체 |
| `src/providers/**` | 얇은 프레임워크 통합 레이어 |
| `src/app/**` | Next.js 프레임워크 파일 |
| `**/__tests__/**` | 이미 테스트 파일 |
| `*.test.*` / `*.spec.*` | 이미 테스트 파일 |

### S2. 각 파일 분류

남은 파일을 **빠르게 읽어** 아래 기준으로 분류한다:

| 분류 | 판단 기준 | 권장 명령 |
|------|----------|----------|
| **훅** | `src/hooks/` 경로이고 `use`로 시작 | `/write-tests {path}` |
| **통합** | `useQuery` / `useSuspenseQuery` / `lib/apis/` import 존재 | `/write-tests {path} --integration` |
| **UI 컴포넌트** | `src/components/ui/` 경로 | `/write-tests {path}` |
| **도메인 컴포넌트** | `src/components/{feature}/` + API 호출 없음 | `/write-tests {path}` |
| **도메인 컴포넌트** | `src/components/{feature}/` + API 호출 있음 | `/write-tests {path} --integration` |
| **유틸** | `src/lib/` 경로 | `/write-tests {path}` |
| **제외** | 위 어디에도 해당 안 됨 | — |

### S3. 추천 목록 출력

아래 형식으로 출력한다:

```
## 테스트 작성 추천 목록

### 우선순위 높음
- `src/hooks/useXxx.ts` — 커스텀 훅, 상태/사이드이펙트 로직 포함
  → `/write-tests src/hooks/useXxx.ts`

### 우선순위 중간
- `src/components/board/PostList.tsx` — React Query 사용, API 연동
  → `/write-tests src/components/board/PostList.tsx --integration`

### 우선순위 낮음 (선택)
- `src/components/ui/Badge.tsx` — 단순 표시 컴포넌트
  → `/write-tests src/components/ui/Badge.tsx`

### 제외됨
- `src/constants/routes.ts` — 상수 전용
- `src/types/post.ts` — 타입 선언만 있음
```

우선순위 기준:
- **높음**: 훅, 복잡한 상태/계산 로직 포함 파일
- **중간**: API 연동 컴포넌트 (통합 테스트 필요)
- **낮음**: 단순 UI 컴포넌트, 유틸

### S4. 사용자에게 질문

추천 목록 출력 후 물어본다:

> "전체 목록을 순서대로 작성할까요, 아니면 특정 파일을 골라드릴까요?"

- 전체 진행: 우선순위 높음 → 중간 → 낮음 순으로 각 파일에 대해 **[일반 모드] 2단계** 부터 실행
- 특정 파일 선택: 선택된 파일만 진행

---

### 2. generate:tests 스크립트 먼저 시도

`.env.local`에 `ANTHROPIC_API_KEY`가 설정되어 있으면 CLI 스크립트 실행:

```bash
pnpm generate:tests $ARGUMENTS
```

- 성공하면 생성된 파일 경로를 보여주고 종료
- API 키가 없거나 스크립트 실패 → 3단계로 이동

### 3. 테스트 타입 결정

| 조건 | 타입 |
|------|------|
| `--integration` 플래그 있음 | 통합 테스트 (RTL + MSW) |
| React Query / lib/apis로 데이터를 fetch하는 파일 | 통합 테스트 (RTL + MSW) |
| 순수 컴포넌트 / 유틸 / 훅 (API 호출 없음) | 단위 테스트 |

### 4. 해당 타입의 예시를 읽은 뒤 테스트 작성

| 타입 | 예시 파일 |
|------|----------|
| UI 컴포넌트 | [examples/Button.test.md](examples/Button.test.md) |
| 훅 | [examples/useMonthNavigator.test.md](examples/useMonthNavigator.test.md) |
| 통합 테스트 (React Query + MSW) | [examples/HomeDashboard.integration.test.md](examples/HomeDashboard.integration.test.md) |

#### 출력 경로 컨벤션

| 소스 파일 | 테스트 파일 |
|----------|------------|
| `src/components/ui/Button.tsx` | `src/components/ui/__tests__/Button.test.tsx` |
| `src/hooks/useAutoScroll.ts` | `src/hooks/__tests__/useAutoScroll.test.ts` |
| `src/app/page.tsx` | `src/app/__tests__/page.test.tsx` |

확장자: `.tsx` → `.test.tsx`, `.ts` → `.test.ts`

#### 필수 테스트 케이스

1. **Smoke 테스트** — 크래시 없이 렌더링되는지 확인
2. **Props / variant 동작** — 다른 variant prop이 다른 결과를 내는지 확인
3. **사용자 인터랙션** — 클릭, 입력 등 이벤트 테스트 (존재하는 경우)
4. **접근성** — role, label, aria 속성 확인

#### 금지 사항

- Tailwind 클래스명 단언 금지: `expect(el).toHaveClass('bg-button-primary')` ❌
- `next/image`, `next/navigation` 재모킹 금지 (`jest.setup.tsx`에서 이미 처리됨)
- 구현 세부사항(내부 state, ref 직접 접근) 테스트 금지
- 항상 `userEvent.setup()` 사용, `fireEvent` 금지

### 5. 기존 테스트 처리

테스트 파일이 이미 존재하는 경우:
- 현재 통과 중인 테스트는 모두 유지
- 누락된 케이스만 추가 (점진적 업데이트)

### 6. 완료 후

- 생성/수정된 파일 경로를 링크로 표시
- `pnpm test` 실행 여부를 사용자에게 질문
