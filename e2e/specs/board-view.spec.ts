import { test, expect } from '@playwright/test';

import { resolveClubId, openEditor, deletePost } from '../helpers';

/**
 * 전제 조건:
 * - DEV_ACCESS_TOKEN이 유효하고 쓰기 가능한 게시판이 1개 이상 있어야 한다.
 * - beforeAll에서 테스트용 게시글을 자동 생성하여 boardId / postId를 확보한다.
 */
test.describe('게시판 조회', () => {
  test.describe.configure({ mode: 'serial' });

  let clubId: string;
  let boardId: string;
  let postId: string;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(60_000);
    const context = await browser.newContext({
      storageState: 'e2e/.auth/user.json',
    });
    const page = await context.newPage();

    try {
      clubId = await resolveClubId(page);

      const editor = await openEditor(page, `/${clubId}/board/write`);
      await page.getByPlaceholder('제목').fill('[E2E] 게시판 조회 테스트용 게시글');
      await editor.type('E2E 게시판 조회 테스트 본문입니다.');
      await page.getByRole('button', { name: '게시하기' }).click();

      await page.waitForURL(new RegExp(`/${clubId}/board/\\d+/\\d+`), { timeout: 15_000 });

      const match = new URL(page.url()).pathname.match(/\/board\/(\d+)\/(\d+)$/);
      if (!match) throw new Error(`게시글 생성 후 URL 파싱 실패: ${page.url()}`);
      [, boardId, postId] = match;
    } finally {
      await context.close().catch(() => {});
    }
  });

  test.afterAll(async () => {
    if (clubId && boardId && postId) {
      await deletePost(clubId, boardId, postId);
    }
  });

  test('게시판 목록 페이지에 게시글이 article로 렌더링된다', async ({ page }) => {
    await page.goto(`/${clubId}/board/${boardId}`);
    await expect(page.locator('article').first()).toBeVisible({ timeout: 10_000 });
  });

  test('게시글 클릭 시 상세 페이지로 이동한다', async ({ page }) => {
    await page.goto(`/${clubId}/board/${boardId}`);

    const postLink = page
      .locator('article')
      .filter({ hasText: '[E2E] 게시판 조회 테스트용 게시글' })
      .locator('a')
      .first();
    await postLink.click();

    await page.waitForURL(new RegExp(`/${clubId}/board/${boardId}/\\d+$`), { timeout: 10_000 });
    expect(page.url()).toMatch(new RegExp(`/${clubId}/board/${boardId}/\\d+$`));
  });

  test('게시글 상세 페이지에 제목이 표시된다', async ({ page }) => {
    await page.goto(`/${clubId}/board/${boardId}/${postId}`);
    await expect(page.getByText('[E2E] 게시판 조회 테스트용 게시글')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('게시글 상세 페이지에 좋아요·댓글 버튼이 있다', async ({ page }) => {
    await page.goto(`/${clubId}/board/${boardId}/${postId}`);
    await expect(page.getByRole('button', { name: '좋아요' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: '댓글', exact: true })).toBeVisible({
      timeout: 10_000,
    });
  });
});
