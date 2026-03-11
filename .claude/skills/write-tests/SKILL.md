---
name: write-tests
description: "Writes Jest + React Testing Library tests for components, hooks, and pages."
argument-hint: "[file path]"
disable-model-invocation: true
allowed-tools: Glob, Grep, Read, Bash, Write, Edit
---

# Write Tests

Analyzes the target file and writes Jest + React Testing Library tests.

## Arguments

Specify the file path to test via `$ARGUMENTS`.

- `/write-tests src/components/ui/Button.tsx`
- `/write-tests src/hooks/useAutoScroll.ts`
- `/write-tests` (if omitted, use the currently open file in IDE or ask the user)

## Workflow (follow in order)

### 1. Identify the target file

- If a path is given via `$ARGUMENTS`, use it as-is
- Otherwise, target the currently open file in the IDE
- If still unclear, ask the user

### 2. Try the generate:tests script first

If `ANTHROPIC_API_KEY` is set in `.env.local`, run the CLI script:

```bash
pnpm generate:tests $ARGUMENTS
```

- On success, show the generated file path and stop
- If API key is missing or the script fails → proceed to step 3

### 3. Write tests directly

Read the target file with Read, then write tests following the rules below.

#### Output path convention

| Source file | Test file |
|---|---|
| `src/components/ui/Button.tsx` | `src/components/ui/__tests__/Button.test.tsx` |
| `src/hooks/useAutoScroll.ts` | `src/hooks/__tests__/useAutoScroll.test.ts` |
| `src/app/page.tsx` | `src/app/__tests__/page.test.tsx` |

Extension: `.tsx` → `.test.tsx`, `.ts` → `.test.ts`

#### Required test cases

1. **Smoke test** — verify it renders without crashing
2. **Props / variant behavior** — verify different variant props produce different visual behavior
3. **User interactions** — include tests for clicks, inputs, and other events if present
4. **Accessibility** — verify role, label, and other a11y attributes

#### Test writing rules

```tsx
// ✅ Imports
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// @testing-library/jest-dom is globally registered — no import needed

// ✅ Always use userEvent.setup()
const user = userEvent.setup();
await user.click(element);

// ✅ Query priority
// getByRole > getByLabelText > getByText > getByTestId

// ❌ Forbidden
// Do not assert Tailwind class names: expect(el).toHaveClass('bg-button-primary')
// Do not re-mock next/image or next/navigation (already handled in jest.setup.ts)
// Do not test implementation details (internal state, direct ref access, etc.)
```

#### cva variant test pattern

```tsx
it.each([
  ['primary'],
  ['secondary'],
] as const)('renders variant=%s', (variant) => {
  render(<Component variant={variant} />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

#### forwardRef component

```tsx
it('attaches ref to the DOM element', () => {
  const ref = React.createRef<HTMLButtonElement>();
  render(<Button ref={ref}>Click</Button>);
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});
```

#### Hook tests — renderHook + act

For hook files (`.ts`), use `renderHook` + `act` instead of `render`.

```tsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '@/hooks/useCounter';

// ✅ Basic usage — check initial value
it('initial count is 0', () => {
  const { result } = renderHook(() => useCounter());
  expect(result.current.count).toBe(0);
});

// ✅ State change — wrap in act()
it('increments count by 1 when increment is called', () => {
  const { result } = renderHook(() => useCounter());
  act(() => {
    result.current.increment();
  });
  expect(result.current.count).toBe(1);
});

// ✅ Async state change — await act()
it('fills data after async fetch', async () => {
  const { result } = renderHook(() => useFetchData());
  await act(async () => {
    await result.current.load();
  });
  expect(result.current.data).not.toBeNull();
});

// ✅ Props change — rerender
it('resets count when initialValue prop changes', () => {
  const { result, rerender } = renderHook(
    ({ initialValue }) => useCounter(initialValue),
    { initialProps: { initialValue: 0 } },
  );
  rerender({ initialValue: 10 });
  expect(result.current.count).toBe(10);
});

// ✅ Hooks that need userEvent (DOM interaction)
it('responds to input events', async () => {
  const user = userEvent.setup();
  const { result } = renderHook(() => useSearch());

  const input = document.createElement('input');
  document.body.appendChild(input);

  await user.type(input, 'hello');
  // assert result.current state ...
});
```

> **Rules**
> - All hook calls that cause state or side effects must run inside `act()`
> - Async hooks: `await act(async () => { ... })`
> - Isolate external dependencies (APIs, timers) with `jest.mock` / `jest.useFakeTimers`

### 4. Handle existing tests

If the test file already exists:
- Keep all currently passing tests
- Only add missing cases (incremental update)

### 5. After completion

- Show the created/modified file path as a link
- Ask the user whether to run `pnpm test`

## Supporting Files

- Example test: [examples/Button.test.md](examples/Button.test.md)
