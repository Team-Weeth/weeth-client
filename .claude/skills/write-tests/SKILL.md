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

### 4. 기존 테스트 처리

테스트 파일이 이미 존재하면:
- 기존 통과 테스트는 그대로 유지
- 누락된 케이스만 추가 (증분 업데이트)

### 5. 완료 후 안내

- 생성/수정된 파일 경로 링크로 안내
- `pnpm test` 실행 여부를 사용자에게 묻기

## 지원 파일

- 예시 테스트: [examples/Button.test.tsx](examples/Button.test.tsx)
