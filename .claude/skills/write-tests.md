# write-tests

테스트 대상 파일을 분석해 Jest + React Testing Library 테스트 코드를 작성한다.

## 트리거

사용자가 `/write-tests` 를 입력하거나 특정 파일의 테스트 작성을 요청할 때.

## 실행 절차

### 1. 대상 파일 파악

- 사용자가 파일 경로를 명시했으면 그대로 사용
- 명시하지 않았으면 현재 IDE에서 열린 파일 또는 최근에 언급된 파일을 대상으로 삼는다
- 대상이 불명확하면 AskUserQuestion 으로 확인한다

### 2. generate:tests 스크립트 우선 시도

`ANTHROPIC_API_KEY`가 `.env.local`에 설정돼 있으면 CLI 스크립트를 실행한다.

```bash
pnpm generate:tests <대상-파일-경로>
```

- 스크립트가 성공하면 생성된 파일 경로를 사용자에게 알리고 종료
- API Key 없음 / 스크립트 실패 → 3단계로 진행

### 3. Claude가 직접 테스트 작성

대상 파일을 Read 로 읽은 뒤 아래 규칙에 따라 테스트 파일을 작성한다.

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
// - Tailwind 클래스명 단언 금지 (e.g. expect(el).toHaveClass('bg-button-primary'))
// - next/image, next/navigation 재모킹 금지 (jest.setup.ts에서 이미 처리)
// - 구현 세부사항 테스트 금지 (내부 state, ref 직접 접근 등)
```

#### cva variant 테스트 패턴

```tsx
it.each([
  ['primary', '...기대 텍스트 or role'],
  ['secondary', '...기대 텍스트 or role'],
])('variant=%s 렌더링', (variant, expected) => {
  render(<Component variant={variant as Variant} />);
  expect(screen.getByRole('...')).toBeInTheDocument();
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

### 4. 기존 테스트 파일 처리

테스트 파일이 이미 존재하면:
- 기존 통과 테스트는 그대로 유지
- 누락된 케이스만 추가 (증분 업데이트)

### 5. 완료 후 안내

- 생성/수정된 파일 경로 링크로 안내
- `pnpm test` 실행 여부를 사용자에게 묻는다
