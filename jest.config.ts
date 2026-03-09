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

  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/scripts/', '<rootDir>/.claude/'],

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/app/layout.tsx',
  ],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['text', 'lcov', 'json-summary'],

  // coverageThreshold: 테스트가 충분히 쌓이면 활성화
  // coverageThreshold: {
  //   global: { branches: 50, functions: 50, lines: 50, statements: 50 },
  // },
};

export default createJestConfig(config);
