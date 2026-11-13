import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/wax',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: { baseURL: 'http://127.0.0.1:3103', trace: 'retain-on-failure' },
  projects: [
    {
      name: 'wax-chromium',
      use: {
        ...devices['Desktop Chrome'],
        // 3D 장면은 GPU를 쓸 수 있으면 쓴다. 없으면 소프트웨어 렌더링으로 느리게 돈다.
        launchOptions: {
          args: [
            '--ignore-gpu-blocklist',
            ...(process.platform === 'darwin' ? ['--use-angle=metal'] : []),
          ],
        },
      },
    },
  ],
});
