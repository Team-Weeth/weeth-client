# Testing

## 전략 선택 기준

| 상황 | 도구 | 위치 |
|------|------|------|
| 유틸 함수, 복잡한 계산 로직 | Jest (Unit) | `src/**/__tests__/` |
| 커스텀 훅 (`use*.ts`) | Jest + `renderHook` | `src/hooks/__tests__/` |
| 단일 컴포넌트 props/상태/이벤트 | Jest + RTL | `src/**/__tests__/` |
| 컴포넌트 + API 연동 흐름 | RTL + MSW (Integration) | `src/**/__tests__/` |
| 핵심 사용자 시나리오 전체 플로우 | Playwright (E2E) | `e2e/*.spec.ts` |
| UI 시각적 회귀 검증 | Playwright Screenshot | `e2e/*.spec.ts` |

**우선순위:** 단위 < 통합(가성비 최고) < E2E < 시각적 회귀

---

## 파일 위치 컨벤션

```
src/components/ui/Button.tsx     → src/components/ui/__tests__/Button.test.tsx
src/hooks/useMonthNavigator.ts   → src/hooks/__tests__/useMonthNavigator.test.ts
src/lib/cn.ts                    → src/lib/__tests__/cn.test.ts
e2e/auth.spec.ts                 ← Playwright E2E
```

---

## 단위 테스트 규칙 (Jest + RTL)

- `@testing-library/jest-dom` 전역 등록 — import 불필요
- `next/navigation`, `next/image`는 `jest.setup.tsx`에서 이미 mock — 재선언 금지
- Query 우선순위: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
- 이벤트는 항상 `userEvent.setup()` 사용 (`fireEvent` 금지)
- Tailwind 클래스명 단언 금지 (`toHaveClass('bg-button-primary')` ❌)
- 구현 세부사항(내부 state, ref 직접 접근) 테스트 금지
- cva variant는 `it.each`로 순회

### 필수 케이스
1. **Smoke** — renders without crashing
2. **Props / variant** — 다른 variant가 다른 결과를 내는지
3. **User interactions** — click, input 등 이벤트
4. **Accessibility** — role, label, aria 속성

---

## 훅 테스트 규칙 (renderHook + act)

- 상태를 변경하는 훅 호출 → `act(() => { ... })`
- 비동기 상태 변경 → `await act(async () => { ... })`
- `new Date()`로 초기화되는 훅 → `jest.useFakeTimers()` + `jest.setSystemTime()`으로 고정, `afterEach`에서 `jest.useRealTimers()` 복구 필수
- 외부 의존성(API, 타이머) → `jest.mock` / `jest.useFakeTimers`로 격리

---

## 통합 테스트 규칙 (RTL + MSW)

- MSW 서버는 `jest.setup.tsx`에서 전역 등록 완료 — 별도 서버 설정 불필요
- `server.use()` 오버라이드는 `afterEach`에서 자동 리셋됨
- 비동기 데이터 로딩 → `findBy*` 사용 (`getBy*` ❌)
- React Query 사용 컴포넌트 → `QueryClientProvider` 래핑 + `retry: false` 필수
- Zustand store 의존 훅/컴포넌트 → `jest.mock('@/stores/use{Name}Store', ...)` 로 값 고정
- 글로벌 handlers에 없는 API → 테스트 파일 `beforeEach`에서 `server.use()` 등록

### MSW 핸들러 추가

`src/mocks/handlers/{domain}.ts` 생성 후 `src/mocks/handlers/index.ts`에 추가:

```ts
export const handlers = [...authHandlers, ...domainHandlers];
```

---

## Playwright MCP — 브라우저 직접 조작

`.claude/settings.json`에 `@playwright/mcp` 서버가 등록되어 있어, Claude가 대화 중 브라우저를 직접 열고 조작할 수 있습니다.

**MCP가 적합한 상황**
- "이 버튼 누르면 에러 나?" 같은 즉흥적 QA
- 버그 재현 및 탐색적 테스트
- 시각적 결과 확인 (스크린샷)

**`.spec.ts` 파일이 적합한 상황**
- CI/CD 회귀 테스트 (MCP 세션은 대화가 끝나면 사라짐)
- 배포 전 전체 케이스 자동 검증

> 두 방식은 경쟁이 아니라 보완 관계 — 탐색은 MCP, 자동화는 `.spec.ts`

---

## E2E 테스트 (Playwright)

파일 위치: `e2e/{feature}.spec.ts`

Locator 우선순위:

```ts
page.getByRole('button', { name: '제출' })  // 1순위
page.getByLabel('이메일')                    // 2순위
page.getByText('공지사항')                   // 3순위
page.getByTestId('submit-btn')              // 최후 수단
```

---

## 시각적 회귀 테스트 (Playwright Screenshot)

```ts
await expect(page).toHaveScreenshot('home.png', { maxDiffPixelRatio: 0.01 });
```

- 기준 스냅샷은 `--update-snapshots`로 생성
- 스냅샷 파일은 git에 커밋 필수 (CI 비교용)

---

## 명령어

```bash
pnpm test                                          # Jest 전체
pnpm test --watch                                  # 파일 변경 감지
pnpm test src/components/ui                        # 특정 경로만
pnpm test:coverage                                 # 커버리지 포함

pnpm exec playwright test                          # E2E 전체
pnpm exec playwright test --ui                     # 인터랙티브 UI 모드
pnpm exec playwright test --update-snapshots       # 스냅샷 업데이트
pnpm exec playwright show-report                   # HTML 결과 보고서
```
