import { test as setup } from '@playwright/test';
import path from 'path';

export const authFile = path.join(__dirname, '../.auth/user.json');

setup('authenticate', async ({ browser }) => {
  const token = process.env.DEV_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      'DEV_ACCESS_TOKEN 환경변수가 설정되지 않았습니다.\n' +
        '로컬: .env.local에 추가 / CI: GitHub Secrets에 등록하세요.',
    );
  }

  const context = await browser.newContext();

  await context.addCookies([
    {
      name: 'access_token',
      value: token,
      domain: 'localhost',
      path: '/',
    },
  ]);

  await context.storageState({ path: authFile });
  await context.close();
});
