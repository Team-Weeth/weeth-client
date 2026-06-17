# 테스트 가이드

Weeth 클라이언트의 테스트 환경 사용법과 작성 규칙을 다룹니다.

---

## 목차

1. [테스트 스택 개요](#1-테스트-스택-개요)
2. [빠른 시작 — 명령어](#2-빠른-시작--명령어)
3. [파일 위치 컨벤션](#3-파일-위치-컨벤션)
4. [단위 테스트 작성법](#4-단위-테스트-작성법)
5. [훅 테스트 작성법](#5-훅-테스트-작성법)
6. [통합 테스트 작성법 (MSW)](#6-통합-테스트-작성법-msw)
7. [MSW 핸들러 추가](#7-msw-핸들러-추가)
8. [E2E 테스트 작성법](#8-e2e-테스트-작성법)
9. [규칙 & 금지사항](#9-규칙--금지사항)
10. [CI / GitHub Actions](#10-ci--github-actions)

---

## 1. 테스트 스택 개요

| 유형 | 도구 | 대상 |
|------|------|------|
| 단위 테스트 | Jest + React Testing Library | 컴포넌트, 유틸 함수 |
| 훅 테스트 | Jest + `renderHook` | 커스텀 훅 (`use*.ts`) |
| 통합 테스트 | RTL + MSW | 컴포넌트 + API 연동 흐름 |
| E2E 테스트 | Playwright | 핵심 사용자 시나리오 전체 |
| 시각적 회귀 | Playwright Screenshot | UI 변경 전후 비교 |

**우선순위:** 단위 < 통합 (가성비 최고) < E2E < 시각적 회귀

---

## 2. 빠른 시작 — 명령어

```bash
# Jest (단위 / 통합)
pnpm test                              # 전체 실행
pnpm test --watch                      # 파일 변경 감지 모드
pnpm test src/components/ui            # 특정 경로만
pnpm test:coverage                     # 커버리지 리포트 포함
pnpm test:ci                           # CI 환경용

# Playwright (E2E)
pnpm test:e2e                          # 전체 실행 (헤드리스)
pnpm test:e2e:ui                       # 인터랙티브 UI 모드 (시각적 디버깅)
pnpm test:e2e:debug                    # 단계별 실행 (상세 로깅)
pnpm test:e2e:report                   # 최근 테스트 HTML 보고서 보기
```

---

## 3. 파일 위치 컨벤션

소스 파일과 테스트 파일을 같은 폴더 안 `__tests__/` 디렉토리에 놓습니다.

```
src/components/ui/Button.tsx
  └─ src/components/ui/__tests__/Button.test.tsx

src/hooks/useMonthNavigator.ts
  └─ src/hooks/__tests__/useMonthNavigator.test.ts

src/lib/cn.ts
  └─ src/lib/__tests__/cn.test.ts

e2e/specs/landing.spec.ts              # Playwright E2E
```

**확장자 규칙:** `.tsx` → `.test.tsx` / `.ts` → `.test.ts`

---

## 4. 단위 테스트 작성법

### 4-1. 기본 구조

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('children을 렌더링한다', () => {
    render(<Button>클릭</Button>);
    expect(screen.getByRole('button', { name: '클릭' })).toBeInTheDocument();
  });

  it('onClick이 호출된다', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>클릭</Button>);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 4-2. cva variant 테스트 — `it.each` 사용

```tsx
it.each(['primary', 'secondary', 'tertiary'] as const)(
  'variant="%s"로 렌더링된다',
  (variant) => {
    render(<Button variant={variant}>클릭</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  },
);
```

### 4-3. 필수 케이스

| 케이스 | 확인 항목 |
|--------|----------|
| **Smoke** | 크래시 없이 렌더링됨 |
| **Props / variant** | 다른 variant가 다른 결과를 냄 |
| **User interaction** | 클릭, 입력 등 이벤트가 동작함 |
| **Accessibility** | role, label, aria 속성이 올바름 |

### 4-4. 쿼리 우선순위

```
getByRole  >  getByLabelText  >  getByText  >  getByTestId
```

`getByTestId`는 위 세 가지로 찾을 수 없을 때만 사용합니다.

---

## 5. 훅 테스트 작성법

### 5-1. 기본 패턴

```ts
import { renderHook, act } from '@testing-library/react';
import { useMonthNavigator } from '@/hooks/useMonthNavigator';

describe('useMonthNavigator', () => {
  it('초기값이 현재 년/월이다', () => {
    const { result } = renderHook(() => useMonthNavigator());
    expect(result.current.year).toBe(new Date().getFullYear());
  });

  // 상태를 바꾸는 호출은 반드시 act()로 감쌉니다
  it('prev() — 이전 달로 이동한다', () => {
    const { result } = renderHook(() => useMonthNavigator());

    act(() => {
      result.current.prev();
    });

    expect(result.current.month).toBe(new Date().getMonth()); // -1
  });
});
```

### 5-2. `new Date()`에 의존하는 훅 — 타이머 고정

```ts
describe('useMonthNavigator', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 1)); // 2026년 6월 고정
  });

  afterEach(() => {
    jest.useRealTimers(); // 반드시 복구
  });

  it('현재 년/월로 초기화된다', () => {
    const { result } = renderHook(() => useMonthNavigator());
    expect(result.current.year).toBe(2026);
    expect(result.current.month).toBe(6);
  });
});
```

### 5-3. 비동기 훅

```ts
it('비동기 로드 후 데이터가 채워진다', async () => {
  const { result } = renderHook(() => useFetchData());

  await act(async () => {
    await result.current.load();
  });

  expect(result.current.data).not.toBeNull();
});
```

---

## 6. 통합 테스트 작성법 (MSW)

API를 직접 호출하는 컴포넌트는 MSW로 서버 응답을 모킹합니다.
`jest.setup.tsx`에서 MSW 서버가 전역으로 등록되어 있으므로 **별도 서버 설정 없이** 바로 사용할 수 있습니다.

### 6-1. 기본 패턴

```tsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostList } from '@/components/board';

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }, // 테스트에서 재시도 비활성화
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

it('게시글 목록을 렌더링한다', async () => {
  renderWithQuery(<PostList />);

  // 비동기 데이터 → findBy* 사용 (getBy* 금지)
  const title = await screen.findByText('첫 번째 글');
  expect(title).toBeInTheDocument();
});
```

### 6-2. 글로벌 핸들러에 없는 API 추가

`src/mocks/handlers/`에 등록된 핸들러 외에, 특정 테스트에만 필요한 응답은 `server.use()`로 덮어씁니다.

```tsx
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';

describe('PostDetail', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/v1/posts/:id', ({ params }) => {
        return HttpResponse.json({
          status: 200,
          data: { id: params.id, title: '테스트 포스트' },
        });
      }),
    );
  });
  // afterEach 리셋은 jest.setup.tsx에서 자동 처리됨

  it('포스트 제목을 표시한다', async () => {
    renderWithQuery(<PostDetail id="1" />);
    expect(await screen.findByText('테스트 포스트')).toBeInTheDocument();
  });
});
```

### 6-3. Zustand store 모킹

```ts
jest.mock('@/stores/useClubStore', () => ({
  useClubId: () => '42',
}));
```

---

## 7. MSW 핸들러 추가

### 파일 구조

```
src/mocks/
  ├── browser.ts           # 브라우저용 MSW worker
  ├── server.ts            # Jest용 MSW server
  └── handlers/
      ├── index.ts         # 핸들러 집계 (여기서 export)
      ├── auth.ts          # 인증 API
      └── {domain}.ts      # 도메인별 핸들러 추가
```

### 새 핸들러 추가 절차

**① `src/mocks/handlers/{domain}.ts` 생성**

```ts
import { http, HttpResponse } from 'msw';

export const postHandlers = [
  http.get('/api/v1/posts', () => {
    return HttpResponse.json({
      status: 200,
      data: [
        { id: 1, title: '첫 번째 글' },
        { id: 2, title: '두 번째 글' },
      ],
    });
  }),

  http.post('/api/v1/posts', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ status: 201, data: { id: 3, ...body } }, { status: 201 });
  }),
];
```

**② `src/mocks/handlers/index.ts`에 추가**

```ts
import { authHandlers } from './auth';
import { postHandlers } from './post'; // 추가

export const handlers = [
  ...authHandlers,
  ...postHandlers, // 추가
];
```

---

## 8. E2E 테스트 작성법

### 8-1. 파일 위치

```
e2e/
  ├── setup/
  │   └── auth.ts          # 인증 전처리 (수정 불필요)
  └── specs/
      └── {feature}.spec.ts  # 기능별 E2E 테스트
```

### 8-2. 기본 패턴

```ts
import { expect, test } from '@playwright/test';

test.describe('게시판', () => {
  test('게시글 목록 페이지가 로드된다', async ({ page }) => {
    await page.goto('/board');
    await expect(page).toHaveTitle(/게시판/);
  });

  test('게시글 작성 후 목록에 표시된다', async ({ page }) => {
    await page.goto('/board/write');

    await page.getByLabel('제목').fill('테스트 제목');
    await page.getByLabel('내용').fill('테스트 내용입니다.');
    await page.getByRole('button', { name: '등록' }).click();

    await expect(page.getByText('테스트 제목')).toBeVisible();
  });
});
```

### 8-3. Locator 우선순위

```ts
page.getByRole('button', { name: '제출' })  // 1순위 — 접근성 기반
page.getByLabel('이메일')                    // 2순위 — 폼 라벨
page.getByText('공지사항')                   // 3순위 — 화면 텍스트
page.getByTestId('submit-btn')              // 최후 수단
```

### 8-4. 인증이 필요한 테스트

`playwright.config.ts`에서 `setup` 프로젝트가 먼저 실행되어 인증 쿠키를 `e2e/.auth/user.json`에 저장합니다.
이후 `chromium` / `mobile-chrome` 프로젝트는 이 파일을 자동으로 로드하므로 **별도 로그인 코드 없이** 인증된 상태로 테스트가 실행됩니다.

로컬에서 E2E를 실행하려면 `.env.local`에 토큰이 필요합니다:

```bash
DEV_ACCESS_TOKEN=여기에_토큰_입력
```

### 8-5. 시각적 회귀 테스트

```ts
test('홈 화면 UI가 변경되지 않았다', async ({ page }) => {
  await page.goto('/home');
  await expect(page).toHaveScreenshot('home.png', { maxDiffPixelRatio: 0.01 });
});
```

스냅샷 기준 이미지 갱신:

```bash
pnpm exec playwright test --update-snapshots
```

> 스냅샷 파일은 git에 반드시 커밋해야 CI에서 비교가 가능합니다.

---

## 9. 규칙 & 금지사항

### 반드시 지킬 것

| 항목 | 이유 |
|------|------|
| 이벤트는 `userEvent.setup()` 사용 | `fireEvent`는 실제 브라우저 동작과 다름 |
| 비동기 렌더링은 `findBy*` 사용 | `getBy*`는 DOM이 생기기 전에 실패함 |
| `act()` 안에서 상태 변경 | 경고 없이 테스트가 불안정해짐 |
| `new Date()` 의존 훅에서 `jest.useFakeTimers()` | 실행 시점에 따라 테스트 결과가 달라짐 |
| React Query 컴포넌트에 `retry: false` | 실패 시 재시도 대기로 테스트가 느려짐 |

### 하지 말 것

```ts
// ❌ Tailwind 클래스명으로 단언
expect(button).toHaveClass('bg-button-primary');

// ❌ next/image, next/navigation 재모킹 (jest.setup.tsx에서 이미 처리)
jest.mock('next/image', ...);
jest.mock('next/navigation', ...);

// ❌ 구현 세부사항 테스트 (내부 state, ref 직접 접근)
expect(component.state.isOpen).toBe(true);

// ❌ fireEvent 사용
fireEvent.click(button);

// ❌ 비동기 응답을 getBy*로 조회
const item = screen.getByText('API 응답 데이터');
```

---

## 10. CI / GitHub Actions

PR이 `main` 또는 `develop`에 올라오면 `.github/workflows/e2e.yml`이 자동으로 실행됩니다.

**워크플로 동작 순서:**
1. 의존성 설치 (`pnpm install --frozen-lockfile`)
2. Playwright 브라우저 설치 (`chromium`)
3. `DEV_ACCESS_TOKEN` secret으로 인증 처리
4. E2E 테스트 실행
5. 결과를 PR에 자동 코멘트로 게시
6. `playwright-report/` 아티팩트 7일 보관

**CI secret 설정** (최초 1회, 레포 관리자):
- GitHub 레포 → Settings → Secrets → `DEV_ACCESS_TOKEN` 등록

**Jest 단위 테스트 CI 실행:**

```bash
pnpm test:ci   # --ci --coverage --passWithNoTests
```

---

## 부록 — 파일 역할 한눈에 보기

```
jest.config.ts              Jest 전체 설정 (환경, 경로 별칭, 커버리지)
jest.setup.tsx              전역 초기화 (jest-dom, MSW 서버, next/image mock)
jest.polyfills.ts           MSW ESM 호환 polyfill (TextEncoder 등)
playwright.config.ts        E2E 설정 (baseURL, 브라우저, 인증)

src/mocks/browser.ts        MSW 브라우저 worker (개발 환경용)
src/mocks/server.ts         MSW Node server (Jest용)
src/mocks/handlers/         API 응답 핸들러 모음
src/providers/msw-provider.tsx  개발 환경 MSW 활성화 Provider

e2e/setup/auth.ts           Playwright 인증 전처리
e2e/specs/                  E2E 테스트 파일
.github/workflows/e2e.yml   E2E CI 워크플로
```
