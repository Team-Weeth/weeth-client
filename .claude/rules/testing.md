# Testing

## Strategy Selection Criteria

| Situation | Tool | Location |
|-----------|------|----------|
| Utility functions, complex computation logic | Jest (Unit) | `src/**/__tests__/` |
| Custom hooks (`use*.ts`) | Jest + `renderHook` | `src/hooks/__tests__/` |
| Single component props/state/events | Jest + RTL | `src/**/__tests__/` |
| Component + API integration flow | RTL + MSW (Integration) | `src/**/__tests__/` |
| Core user scenario end-to-end flow | Playwright (E2E) | `e2e/*.spec.ts` |
| UI visual regression verification | Playwright Screenshot | `e2e/*.spec.ts` |

**Priority:** Unit < Integration (best ROI) < E2E < Visual regression

---

## File Location Convention

```
src/components/ui/Button.tsx     → src/components/ui/__tests__/Button.test.tsx
src/hooks/useMonthNavigator.ts   → src/hooks/__tests__/useMonthNavigator.test.ts
src/lib/cn.ts                    → src/lib/__tests__/cn.test.ts
e2e/auth.spec.ts                 ← Playwright E2E
```

---

## Unit Test Rules (Jest + RTL)

- `@testing-library/jest-dom` is globally registered — no import needed
- `next/navigation` and `next/image` are already mocked in `jest.setup.tsx` — do not re-declare
- Query priority: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
- Always use `userEvent.setup()` for events (`fireEvent` is forbidden)
- No asserting Tailwind class names (`toHaveClass('bg-button-primary')` ❌)
- No testing implementation details (internal state, direct ref access)
- Use `it.each` to iterate over cva variants

### Required Cases
1. **Smoke** — verify it renders without crashing
2. **Props / variant** — verify different variants produce different results
3. **User interactions** — test events like click, input
4. **Accessibility** — verify role, label, aria attributes

---

## Hook Test Rules (renderHook + act)

- Hook calls that change state → wrap in `act(() => { ... })`
- Async state changes → `await act(async () => { ... })`
- Hooks initialized with `new Date()` → fix with `jest.useFakeTimers()` + `jest.setSystemTime()`, restore with `jest.useRealTimers()` in `afterEach`
- External dependencies (API, timers) → isolate with `jest.mock` / `jest.useFakeTimers`

---

## Integration Test Rules (RTL + MSW)

- MSW server is globally registered in `jest.setup.tsx` — no separate server setup needed
- `server.use()` overrides are automatically reset in `afterEach`
- Async data loading → use `findBy*` (`getBy*` ❌)
- Components using React Query → wrap with `QueryClientProvider` + `retry: false` required
- Hooks/components depending on Zustand store → fix values with `jest.mock('@/stores/use{Name}Store', ...)`
- APIs not in global handlers → register with `server.use()` in the test file's `beforeEach`

### Adding MSW Handlers

Create `src/mocks/handlers/{domain}.ts` then add to `src/mocks/handlers/index.ts`:

```ts
export const handlers = [...authHandlers, ...domainHandlers];
```

---

## Playwright MCP — Direct Browser Control

`@playwright/mcp` server is registered in `.claude/settings.json`, allowing Claude to open and interact with a browser directly during a conversation.

**When MCP is appropriate**
- Ad-hoc QA like "does this button cause an error?"
- Bug reproduction and exploratory testing
- Visual result verification (screenshots)

**When `.spec.ts` files are appropriate**
- CI/CD regression tests (MCP sessions disappear when the conversation ends)
- Full automated verification before deployment

> The two approaches are complementary, not competing — explore with MCP, automate with `.spec.ts`

---

## E2E Tests (Playwright)

File location: `e2e/{feature}.spec.ts`

Locator priority:

```ts
page.getByRole('button', { name: '제출' })  // 1st priority
page.getByLabel('이메일')                    // 2nd priority
page.getByText('공지사항')                   // 3rd priority
page.getByTestId('submit-btn')              // last resort
```

---

## Visual Regression Tests (Playwright Screenshot)

```ts
await expect(page).toHaveScreenshot('home.png', { maxDiffPixelRatio: 0.01 });
```

- Generate baseline snapshots with `--update-snapshots`
- Snapshot files must be committed to git (for CI comparison)

---

## Commands

```bash
pnpm test                                          # Run all Jest tests
pnpm test --watch                                  # Watch for file changes
pnpm test src/components/ui                        # Run only a specific path
pnpm test:coverage                                 # Include coverage report

pnpm exec playwright test                          # Run all E2E tests
pnpm exec playwright test --ui                     # Interactive UI mode
pnpm exec playwright test --update-snapshots       # Update snapshots
pnpm exec playwright show-report                   # HTML result report
```
