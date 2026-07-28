import { test, expect } from '@playwright/test';

import { resolveClubId, openEditor } from '../helpers';

/**
 * 전제 조건:
 * - DEV_ACCESS_TOKEN이 유효하고 쓰기 가능한 게시판이 1개 이상 있어야 한다.
 * - 이미지 미리보기 / 파일 항목 테스트는 presigned URL을 반환하는 백엔드가 필요하다.
 *   (업로드 실패 시 파일이 스토어에서 즉시 제거되어 미리보기가 사라질 수 있다.)
 */
test.describe('파일 첨부', () => {
  let writeUrl: string;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(60_000);
    const context = await browser.newContext({
      storageState: 'e2e/.auth/user.json',
    });
    const page = await context.newPage();

    try {
      const clubId = await resolveClubId(page);
      writeUrl = `/${clubId}/board/write`;
    } finally {
      await context.close().catch(() => {});
    }
  });

  test('에디터에서 "/" 입력 시 슬래시 메뉴에 이미지·파일 버튼이 표시된다', async ({ page }) => {
    const editor = await openEditor(page, writeUrl);
    await editor.type('/');

    await expect(page.getByRole('button', { name: '이미지' })).toBeVisible({ timeout: 5_000 });
    await expect(page.getByRole('button', { name: '파일' })).toBeVisible({ timeout: 5_000 });
  });

  test('슬래시 메뉴 이미지 버튼 클릭 시 파일 선택기가 열린다', async ({ page }) => {
    const editor = await openEditor(page, writeUrl);
    await editor.type('/');
    await expect(page.getByRole('button', { name: '이미지' })).toBeVisible({ timeout: 5_000 });

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: '이미지' }).click(),
    ]);

    expect(fileChooser).toBeDefined();
  });

  test('슬래시 메뉴 파일 버튼 클릭 시 파일 선택기가 열린다', async ({ page }) => {
    const editor = await openEditor(page, writeUrl);
    await editor.type('/');
    await expect(page.getByRole('button', { name: '파일' })).toBeVisible({ timeout: 5_000 });

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: '파일' }).click(),
    ]);

    expect(fileChooser).toBeDefined();
  });

  test('이미지 파일 선택 후 에디터 하단에 이미지 미리보기가 표시된다', async ({ page }) => {
    const editor = await openEditor(page, writeUrl);
    await editor.type('/');
    await expect(page.getByRole('button', { name: '이미지' })).toBeVisible({ timeout: 5_000 });

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: '이미지' }).click(),
    ]);

    await fileChooser.setFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), // PNG signature
    });

    await expect(page.locator('img[alt="test-image.png"]')).toBeVisible({ timeout: 10_000 });
  });

  test('비이미지 파일 선택 후 에디터 하단에 파일 항목이 표시된다', async ({ page }) => {
    const editor = await openEditor(page, writeUrl);
    await editor.type('/');
    await expect(page.getByRole('button', { name: '파일' })).toBeVisible({ timeout: 5_000 });

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: '파일' }).click(),
    ]);

    await fileChooser.setFiles({
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4'),
    });

    await expect(page.getByText('test-document.pdf')).toBeVisible({ timeout: 10_000 });
  });

  test('이미지 삭제 버튼 클릭 시 미리보기가 제거된다', async ({ page }) => {
    const editor = await openEditor(page, writeUrl);
    await editor.type('/');
    await expect(page.getByRole('button', { name: '이미지' })).toBeVisible({ timeout: 5_000 });

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: '이미지' }).click(),
    ]);

    await fileChooser.setFiles({
      name: 'removable.png',
      mimeType: 'image/png',
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    });

    await expect(page.locator('img[alt="removable.png"]')).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: 'removable.png 삭제' }).click();

    await expect(page.locator('img[alt="removable.png"]')).not.toBeVisible();
  });

  test('파일 삭제 버튼 클릭 시 파일 항목이 제거된다', async ({ page }) => {
    const editor = await openEditor(page, writeUrl);
    await editor.type('/');
    await expect(page.getByRole('button', { name: '파일' })).toBeVisible({ timeout: 5_000 });

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: '파일' }).click(),
    ]);

    await fileChooser.setFiles({
      name: 'removable.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4'),
    });

    await expect(page.getByText('removable.pdf')).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: 'removable.pdf 삭제' }).click();

    await expect(page.getByText('removable.pdf')).not.toBeVisible();
  });
});
