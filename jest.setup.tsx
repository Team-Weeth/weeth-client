import '@testing-library/jest-dom';
import { server } from '@/mocks/server';

// lottie-web은 canvas.getContext()를 사용하는데 JSDOM에 미구현
// @/components/ui 배럴을 import하는 테스트 모두에 영향하므로 전역 mock 처리
jest.mock('lottie-react', () => ({
  __esModule: true,
  default: () => null,
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

jest.mock('next/navigation', () => {
  const routerInstance = {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  };
  return {
    useRouter: () => routerInstance,
    useParams: jest.fn(() => ({ clubId: 'test-club-id' })),
    usePathname: jest.fn(() => '/'),
    useSearchParams: jest.fn(() => new URLSearchParams()),
  };
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));
