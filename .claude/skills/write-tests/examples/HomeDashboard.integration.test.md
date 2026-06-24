# Integration Test Example — HomeDashboard

Example test written at `src/components/home/__tests__/HomeDashboard.integration.test.tsx`.

Source: `src/components/home/HomeDashboard.tsx` (uses `useHomeQuery` → `homeApi.getDashboard`)

```tsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';
import { HomeDashboard } from '@/components/home';

// 1. Zustand store mock — useClubId()가 항상 '42'를 반환하도록 고정
//    useHomeQuery는 clubId에 의존하므로 store를 모킹해 결정론적으로 만든다
jest.mock('@/stores/useClubStore', () => ({
  useClubId: () => '42',
}));

// 2. 성공 응답 픽스처
const mockDashboard = {
  club: {
    id: '42',
    name: '위드 개발팀',
    code: 'WEETH',
    schoolName: '위드대학교',
    description: '클럽 소개',
    memberCount: 10,
    profileImageUrl: null,
    backgroundImageUrl: null,
  },
  myInfo: {
    userInfo: {
      name: '홍길동',
      email: 'hong@weeth.com',
      studentId: '20210001',
      department: '컴퓨터공학과',
      phoneNumber: '010-0000-0000',
      role: 'MEMBER',
    },
    bio: null,
  },
};

// 3. QueryClientProvider 래퍼 헬퍼
//    retry: false — 에러 테스트에서 재시도 없이 즉시 실패 상태 확인
function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe('HomeDashboard (integration)', () => {
  // 4. 각 테스트 전 성공 핸들러 등록
  //    글로벌 handlers에 home 핸들러가 없으므로 여기서 등록
  //    server.use()는 afterEach에서 jest.setup.tsx가 자동으로 리셋함
  beforeEach(() => {
    server.use(
      http.get('/clubs/:clubId/dashboard/home', () =>
        HttpResponse.json({
          status: 200,
          message: '조회 성공',
          data: mockDashboard,
        }),
      ),
    );
  });

  // 5. 성공 케이스 — findBy*(비동기) 사용
  it('클럽 이름과 사용자 이름을 렌더링한다', async () => {
    renderWithQuery(<HomeDashboard />);

    expect(await screen.findByText('위드 개발팀')).toBeInTheDocument();
    expect(screen.getByText('홍길동')).toBeInTheDocument();
  });

  // 6. 에러 케이스 — beforeEach 핸들러를 이 테스트에서만 오버라이드
  it('API 에러 시 에러 메시지를 표시한다', async () => {
    server.use(
      http.get('/clubs/:clubId/dashboard/home', () =>
        HttpResponse.json({ message: '서버 오류' }, { status: 500 }),
      ),
    );

    renderWithQuery(<HomeDashboard />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  // 7. 로딩 케이스 — 비동기 응답 전 로딩 UI 확인
  it('데이터 로딩 중 스켈레톤을 표시한다', () => {
    renderWithQuery(<HomeDashboard />);

    // 로딩 인디케이터에 aria-label="로딩 중" 또는 role="status" 필요
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
```

## 포인트

| 패턴 | 이유 |
|------|------|
| `jest.mock('@/stores/useClubStore', ...)` | React Query 훅이 Zustand store 값에 의존할 때 store를 모킹해 외부 의존성 제거 |
| `retry: false` | 에러 테스트 시 기본 3회 재시도로 인한 느린 실행 방지 |
| `beforeEach`에 핸들러 등록 | 글로벌 handlers에 없는 API는 테스트 파일 안에서 등록; 리셋은 jest.setup.tsx가 처리 |
| `server.use()` 오버라이드 | 같은 엔드포인트라도 특정 테스트만 에러/다른 응답으로 덮어쓸 수 있음 |
| `findByText` / `findByRole` | 비동기 데이터 로딩을 기다리는 쿼리; `getBy*`는 동기라 사용 불가 |
| `getByRole('status')` | 로딩 UI에 `role="status"` 또는 `aria-label` 부여 필요 — 접근성도 같이 검증 |

## MSW 핸들러를 글로벌로 올리려면

여러 테스트 파일에서 같은 API를 공유한다면 `src/mocks/handlers/home.ts`를 만들고
`src/mocks/handlers/index.ts`에 추가해 `beforeEach` 없이 재사용한다.

```ts
// src/mocks/handlers/home.ts
import { http, HttpResponse } from 'msw';

export const homeHandlers = [
  http.get('/clubs/:clubId/dashboard/home', () =>
    HttpResponse.json({
      status: 200,
      message: '조회 성공',
      data: mockDashboard,
    }),
  ),
];

// src/mocks/handlers/index.ts
import { authHandlers } from './auth';
import { homeHandlers } from './home';

export const handlers = [...authHandlers, ...homeHandlers];
```
