import { test as setup } from '@playwright/test';
import path from 'path';

export const authFile = path.join(__dirname, '../.auth/user.json');

setup('authenticate', async ({ browser }) => {
  const context = await browser.newContext();

  await context.addCookies([
    {
      name: 'access_token',
      value: process.env.DEV_ACCESS_TOKEN!,
      domain: 'localhost',
      path: '/',
    },
  ]);

  await context.storageState({ path: authFile });
  await context.close();
});
