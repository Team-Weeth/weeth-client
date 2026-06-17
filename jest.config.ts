import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  testEnvironment: 'jest-fixed-jsdom',
  setupFiles: ['<rootDir>/jest.polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/*.{spec,test}.{ts,tsx}'],

  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/scripts/',
    '<rootDir>/.claude/',
    '<rootDir>/e2e/',
  ],

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    // 타입 정의
    '!src/**/*.d.ts',
    // 배럴 export
    '!src/**/index.ts',
    // Next.js App Router 파일 (프레임워크 관리, 단위 테스트 대상 아님)
    '!src/app/**',
    // 테스트용 mock 파일
    '!src/mocks/**',
    // 프로바이더 래퍼 (얇은 프레임워크 통합 레이어)
    '!src/providers/**',
    // 타입 전용 파일
    '!src/types/**',
    // 에셋
    '!src/assets/**',
  ],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['text', 'lcov', 'json-summary', 'html'],

  // 테스트가 충분히 쌓이면 수치를 높여가며 관리
  // coverageThreshold: {
  //   global: { branches: 50, functions: 50, lines: 50, statements: 50 },
  // },
};

const jestConfig = createJestConfig(config);

// createJestConfig 병합 동작:
//   transformIgnorePatterns = [...Next.js 생성 패턴, ...커스텀 패턴]
const resolvedJestConfig = async () => {
  const cfg = await (jestConfig as () => Promise<Config>)();

  // MSW 및 그 전이 의존성 중 type: "module" 인 패키지 목록
  // 패키지 추가 시: pnpm 스토어에서 package.json의 "type": "module" 확인
  const ESM_PACKAGES = [
    'rettime', // MSW 타이밍 유틸리티
    'until-async', // MSW 비동기 유틸리티
    '@open-draft/deferred-promise', // MSW 내부 Promise 구현체
    'headers-polyfill', // MSW HTTP 헤더 폴리필
  ];

  // 직접 경로 패턴: node_modules/@scope/name/...  → '/' 그대로 사용
  const esmForDirect = ESM_PACKAGES.join('|');
  // pnpm 스토어 패턴: node_modules/.pnpm/@scope+name@version/... → '/' → '\+'
  const esmForPnpm = ESM_PACKAGES.map((p) => p.replace(/\//g, '\\+')).join('|');

  cfg.transformIgnorePatterns = (cfg.transformIgnorePatterns ?? []).map((pattern) => {
    if (typeof pattern !== 'string') return pattern;
    // /node_modules/(?!.pnpm)(?!(pkg|...)/)  →  직접 경로에 ESM 패키지 추가
    // /node_modules/.pnpm/(?!(pkg|...)@)      →  pnpm 스토어 경로에 ESM 패키지 추가
    return pattern
      .replace('(?!.pnpm)(?!(', `(?!.pnpm)(?!(${esmForDirect}|`)
      .replace('.pnpm/(?!(', `.pnpm/(?!(${esmForPnpm}|`);
  });

  return cfg;
};

export default resolvedJestConfig;
