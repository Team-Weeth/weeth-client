---
name: write-tests
description: "Writes Jest + React Testing Library tests for components, hooks, and pages. Supports unit tests and integration tests with MSW."
argument-hint: "[file path | --suggest] [--integration]"
disable-model-invocation: true
allowed-tools: Glob, Grep, Read, Bash, Write, Edit
---

# Write Tests

Analyzes the target file and writes Jest + React Testing Library tests.

For strategy, rules, and file location conventions, refer to `.claude/rules/testing.md`.

## Arguments

- `/write-tests src/components/ui/Button.tsx` — unit test
- `/write-tests src/hooks/useAutoScroll.ts` — hook test
- `/write-tests src/components/board/PostList.tsx --integration` — MSW integration test
- `/write-tests --suggest` — analyze changed files on the current branch and recommend test targets
- `/write-tests` (omitted) — target the currently open file in the IDE, or ask the user

## Workflow (follow in order)

### 1. Identify the target file

| Condition | Action |
|-----------|--------|
| `$ARGUMENTS` is `--suggest` | Go to **[Suggest Mode]** |
| `$ARGUMENTS` is a file path | Proceed to step 2 with that file |
| `$ARGUMENTS` is empty | Go to **[Suggest Mode]** (automatic) |

---

## [Suggest Mode] `--suggest`

### S1. Collect changed files on the branch

```bash
git diff main...HEAD --name-only --diff-filter=AM
```

**Exclude** the following from the results:

| Exclusion pattern | Reason |
|-------------------|--------|
| `*.d.ts` | Type declarations only |
| `**/index.ts` | Barrel exports |
| `src/types/**` | Types only |
| `src/constants/**` | Constants only |
| `src/assets/**` | Assets |
| `src/mocks/**` | Test fixtures themselves |
| `src/providers/**` | Thin framework integration layer |
| `src/app/**` | Next.js framework files |
| `**/__tests__/**` | Already test files |
| `*.test.*` / `*.spec.*` | Already test files |

### S2. Classify each file

**Quickly read** the remaining files and classify them by the following criteria:

| Classification | Criteria | Recommended command |
|----------------|----------|---------------------|
| **Hook** | Path under `src/hooks/` and starts with `use` | `/write-tests {path}` |
| **Integration** | Imports `useQuery` / `useSuspenseQuery` / `lib/apis/` | `/write-tests {path} --integration` |
| **UI component** | Path under `src/components/ui/` | `/write-tests {path}` |
| **Domain component** | `src/components/{feature}/` + no API calls | `/write-tests {path}` |
| **Domain component** | `src/components/{feature}/` + has API calls | `/write-tests {path} --integration` |
| **Utility** | Path under `src/lib/` | `/write-tests {path}` |
| **Excluded** | Doesn't fit any of the above | — |

### S3. Output recommendation list

Output in the following format:

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

Priority criteria:
- **High**: hooks, files with complex state/computation logic
- **Medium**: API-integrated components (require integration tests)
- **Low**: simple UI components, utilities

### S4. Ask the user

After outputting the recommendation list, ask:

> "전체 목록을 순서대로 작성할까요, 아니면 특정 파일을 골라드릴까요?"

- Proceed with all: run **[Normal Mode] from step 2** for each file in order: high → medium → low priority
- Pick specific files: proceed only with the selected files

---

### 2. Determine the test type

| Condition | Type |
|-----------|------|
| `--integration` flag present | Integration test (RTL + MSW) |
| File fetches data via React Query / lib/apis | Integration test (RTL + MSW) |
| Pure component / utility / hook (no API calls) | Unit test |

### 3. Read the relevant example, then write the test

| Type | Example file |
|------|-------------|
| UI component | [examples/Button.test.md](examples/Button.test.md) |
| Hook | [examples/useMonthNavigator.test.md](examples/useMonthNavigator.test.md) |
| Integration test (React Query + MSW) | [examples/HomeDashboard.integration.test.md](examples/HomeDashboard.integration.test.md) |

#### Output path convention

| Source file | Test file |
|-------------|-----------|
| `src/components/ui/Button.tsx` | `src/components/ui/__tests__/Button.test.tsx` |
| `src/hooks/useAutoScroll.ts` | `src/hooks/__tests__/useAutoScroll.test.ts` |
| `src/app/page.tsx` | `src/app/__tests__/page.test.tsx` |

Extension: `.tsx` → `.test.tsx`, `.ts` → `.test.ts`

#### Required test cases

1. **Smoke test** — verify it renders without crashing
2. **Props / variant behavior** — verify different variant props produce different results
3. **User interactions** — test events like click, input (if applicable)
4. **Accessibility** — verify role, label, aria attributes

#### Prohibited

- No asserting Tailwind class names: `expect(el).toHaveClass('bg-button-primary')` ❌
- No re-mocking `next/image` or `next/navigation` (already handled in `jest.setup.tsx`)
- No testing implementation details (internal state, direct ref access)
- Always use `userEvent.setup()`; `fireEvent` is forbidden

### 4. Handle existing tests

If the test file already exists:
- Keep all currently passing tests
- Only add missing cases (incremental update)

### 5. After completion — run tests and check coverage

#### 5-1. Collect test files written on the current branch

```bash
git diff main...HEAD --name-only --diff-filter=AM | grep -E '(__tests__|\.test\.|\.spec\.)'
```

#### 5-2. Derive source file paths

Calculate the corresponding source file from each test file path:

| Test file | Source file |
|-----------|-------------|
| `src/hooks/__tests__/useFoo.test.ts` | `src/hooks/useFoo.ts` |
| `src/components/ui/__tests__/Button.test.tsx` | `src/components/ui/Button.tsx` |

Rule: remove `__tests__/` + `.test.ts` → `.ts` / `.test.tsx` → `.tsx`

#### 5-3. Run tests with coverage

Run using the collected test files and source files:

```bash
pnpm test <test-file-1> <test-file-2> ... --coverage --collectCoverageFrom='["<source-file-1>","<source-file-2>",...]'
```

#### 5-4. Handle results

| Result | Action |
|--------|--------|
| All PASS | Proceed to step 6 |
| Some FAIL | Fix failing cases, then re-run 5-3 |

### 6. Record coverage documentation

After all tests PASS, record the measurements in `docs/아키텍처/테스트-커버리지/`.

#### 6-1. Determine the domain file

Extract the domain from the source file path:

| Source file path pattern | Domain file |
|--------------------------|-------------|
| `src/components/board/**` | `docs/아키텍처/테스트-커버리지/board.md` |
| `src/components/admin/**` | `docs/아키텍처/테스트-커버리지/admin.md` |
| `src/components/auth/**` | `docs/아키텍처/테스트-커버리지/auth.md` |
| `src/components/home/**` | `docs/아키텍처/테스트-커버리지/home.md` |
| `src/components/mypage/**` | `docs/아키텍처/테스트-커버리지/mypage.md` |
| `src/components/ui/**` | `docs/아키텍처/테스트-커버리지/ui.md` |
| `src/hooks/**` | `docs/아키텍처/테스트-커버리지/hooks.md` |
| `src/lib/**` | `docs/아키텍처/테스트-커버리지/lib.md` |
| Multiple domains mixed | Record separately in each domain file |

#### 6-2. Update the domain file

If the domain file **already exists**, find the section for that source file and update the numbers.
If it **does not exist**, create it with the following format:

```markdown
# Test Coverage — {Domain} Domain

Records unit/hook test coverage for files under `src/components/{domain}/`.

---

## {Component/Hook Group Name} (`src/...`)

**Measured**: YYYY-MM-DD
**Test file**: `src/.../__tests__/`
**Total tests**: N

### Coverage by file

| File | Statements | Branches | Functions | Lines |
|------|-----------|---------|---------|-------|
| `filename.ts` | X% | X% | X% | X% |
| **Overall average** | X% | X% | X% | X% |

### Test composition

#### `filename.test.ts` (N tests)

One-line description.

| Case | What is verified |
|------|-----------------|
| ... | ... |

### Uncovered branches

| Line | Content | Reason |
|------|---------|--------|
| ... | ... | ... |

---

## Planned

| File | Priority | Notes |
|------|----------|-------|
| ... | ... | ... |
```

If there are no uncovered branches, omit that section.

#### 6-3. Update the index file

If the domain is not already in the domain list table of `docs/아키텍처/테스트-커버리지.md`, add one row:

```markdown
| {domain} | [[테스트-커버리지/{domain}]] | YYYY-MM-DD |
```

If it already exists, only update the last measured date.
