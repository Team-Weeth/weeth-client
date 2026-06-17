import { expect, test } from '@playwright/test';

test.describe('랜딩 페이지', () => {
  test('타이틀이 노출된다', async ({ page }) => {
    await page.goto('/landing');
    await expect(page).toHaveTitle(/위드/);
  });

  test('로그인 페이지로 이동한다', async ({ page, context, isMobile }) => {
    // storageState로 주입된 인증 쿠키를 제거해 미들웨어 리다이렉트 방지
    await context.clearCookies();
    await page.goto('/landing');

    if (isMobile) {
      // 모바일: 로그인 링크가 Sheet 안에 있으므로 햄버거 메뉴 먼저 오픈
      await page.getByRole('button', { name: '메뉴 열기' }).click();
    }

    const loginLink = page.getByRole('link', { name: '로그인' });
    await loginLink.waitFor({ state: 'visible' });
    await Promise.all([page.waitForURL(/\/login/), loginLink.click()]);
  });
});
