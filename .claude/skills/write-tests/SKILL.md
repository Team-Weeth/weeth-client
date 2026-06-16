---
name: write-tests
description: "Writes Jest + React Testing Library tests for components, hooks, and pages. Supports unit tests and integration tests with MSW."
argument-hint: "[file path] [--integration]"
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
- `/write-tests` (생략 시 IDE에서 현재 열린 파일을 대상으로 하거나 사용자에게 질문)

## 워크플로 (순서대로 따르세요)

### 1. 대상 파일 확인

- `$ARGUMENTS`로 경로가 주어진 경우 그대로 사용
- 없으면 IDE에서 현재 열린 파일을 대상으로 함
- 그래도 불분명하면 사용자에게 질문

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
