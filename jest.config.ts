import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  testEnvironment: 'jsdom',
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

export default createJestConfig(config);
