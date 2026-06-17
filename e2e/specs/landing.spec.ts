import { expect, test } from '@playwright/test';

test.describe('랜딩 페이지', () => {
  test('타이틀이 노출된다', async ({ page }) => {
    await page.goto('/landing');
    await expect(page).toHaveTitle(/위드/);
  });

  test('로그인 페이지로 이동한다', async ({ page }) => {
    await page.goto('/landing');
    const loginButton = page.getByRole('link', { name: /로그인/ });
    await loginButton.click();
    await expect(page).toHaveURL(/sign-in/);
  });
});
