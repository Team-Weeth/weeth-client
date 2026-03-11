---
name: write-tests
description: "컴포넌트/훅/페이지에 대한 Jest + React Testing Library 테스트 코드를 작성한다."
argument-hint: "[파일경로]"
disable-model-invocation: true
allowed-tools: Glob, Grep, Read, Bash, Write, Edit
---

# Write Tests

대상 파일을 분석해 Jest + React Testing Library 테스트 코드를 작성한다.

## 인수

`$ARGUMENTS`로 테스트할 파일 경로를 지정한다.

- `/write-tests src/components/ui/Button.tsx`
- `/write-tests src/hooks/useAutoScroll.ts`
- `/write-tests` (인수 생략 시 IDE에서 열린 파일 또는 사용자에게 확인)

## Workflow (순서 엄수)

### 1. 대상 파일 파악

- `$ARGUMENTS`로 경로가 주어지면 그대로 사용
- 없으면 IDE에서 현재 열린 파일을 대상으로 삼기
- 여전히 불명확하면 사용자에게 확인

### 2. generate:tests 스크립트 우선 시도

`.env.local`에 `ANTHROPIC_API_KEY`가 설정된 경우 CLI 스크립트를 실행한다.

```bash
pnpm generate:tests $ARGUMENTS
```

- 성공 시 생성된 파일 경로를 안내하고 종료
- API Key 없음 / 실패 시 → 3단계 진행

### 3. Claude가 직접 테스트 작성

대상 파일을 Read로 읽은 뒤 아래 규칙에 따라 테스트를 작성한다.

#### 출력 경로 규칙

| 소스 파일 | 테스트 파일 |
|---|---|
| `src/components/ui/Button.tsx` | `src/components/ui/__tests__/Button.test.tsx` |
| `src/hooks/useAutoScroll.ts` | `src/hooks/__tests__/useAutoScroll.test.ts` |
| `src/app/page.tsx` | `src/app/__tests__/page.test.tsx` |

확장자: `.tsx` → `.test.tsx`, `.ts` → `.test.ts`

#### 필수 테스트 항목

1. **스모크 테스트** — 크래시 없이 렌더링되는지 확인
2. **Props / variant 동작** — 다른 variant prop이 다른 시각적 동작을 만드는지 확인
3. **사용자 인터랙션** — 클릭, 입력 등 이벤트가 있으면 반드시 포함
4. **접근성** — role, label 등 접근성 속성 검증

#### 테스트 작성 규칙

```tsx
// ✅ import 방식
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// @testing-library/jest-dom 은 전역 등록됨 — import 불필요

// ✅ userEvent 는 반드시 setup() 사용
const user = userEvent.setup();
await user.click(element);

// ✅ 쿼리 우선순위
// getByRole > getByLabelText > getByText > getByTestId

// ❌ 금지 사항
// Tailwind 클래스명 단언 금지: expect(el).toHaveClass('bg-button-primary')
// next/image, next/navigation 재모킹 금지 (jest.setup.ts에서 이미 처리)
// 구현 세부사항 테스트 금지 (내부 state, ref 직접 접근 등)
```

#### cva variant 테스트 패턴

```tsx
it.each([
  ['primary'],
  ['secondary'],
] as const)('variant=%s 렌더링', (variant) => {
  render(<Component variant={variant} />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

#### forwardRef 컴포넌트

```tsx
it('ref가 DOM 요소에 연결된다', () => {
  const ref = React.createRef<HTMLButtonElement>();
  render(<Button ref={ref}>클릭</Button>);
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});
```

#### 훅 테스트 — renderHook + act

훅 파일(`.ts`)이 대상일 때는 `render` 대신 `renderHook` + `act`를 사용한다.

```tsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '@/hooks/useCounter';

// ✅ 기본 사용 — 초기값 확인
it('초기 count는 0이다', () => {
  const { result } = renderHook(() => useCounter());
  expect(result.current.count).toBe(0);
});

// ✅ 상태 변경 — act()로 감싸기
it('increment 호출 시 count가 1 증가한다', () => {
  const { result } = renderHook(() => useCounter());
  act(() => {
    result.current.increment();
  });
  expect(result.current.count).toBe(1);
});

// ✅ 비동기 상태 변경 — await act()
it('비동기 fetch 후 data가 채워진다', async () => {
  const { result } = renderHook(() => useFetchData());
  await act(async () => {
    await result.current.load();
  });
  expect(result.current.data).not.toBeNull();
});

// ✅ props 변경 — rerender
it('initialValue prop이 변경되면 count가 리셋된다', () => {
  const { result, rerender } = renderHook(
    ({ initialValue }) => useCounter(initialValue),
    { initialProps: { initialValue: 0 } },
  );
  rerender({ initialValue: 10 });
  expect(result.current.count).toBe(10);
});

// ✅ userEvent가 필요한 훅 (DOM과 연동)
it('input 이벤트에 반응한다', async () => {
  const user = userEvent.setup();
  const { result } = renderHook(() => useSearch());

  const input = document.createElement('input');
  document.body.appendChild(input);

  await user.type(input, 'hello');
  // result.current 상태 검증 ...
});
```

> **규칙**
> - 상태·사이드이펙트를 유발하는 모든 훅 호출은 `act()` 안에서 실행
> - 비동기 훅은 `await act(async () => { ... })`
> - 외부 의존성(API, 타이머)은 `jest.mock` / `jest.useFakeTimers`로 격리

### 4. 기존 테스트 처리

테스트 파일이 이미 존재하면:
- 기존 통과 테스트는 그대로 유지
- 누락된 케이스만 추가 (증분 업데이트)

### 5. 완료 후 안내

- 생성/수정된 파일 경로 링크로 안내
- `pnpm test` 실행 여부를 사용자에게 묻기

## 지원 파일

- 예시 테스트: [examples/Button.test.tsx](examples/Button.test.tsx)
