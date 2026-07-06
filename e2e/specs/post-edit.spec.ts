import { test, expect } from '@playwright/test';
import { resolveClubId, openEditor } from '../helpers';

/**
 * 전제 조건:
 * - DEV_ACCESS_TOKEN이 유효하고 쓰기 가능한 게시판이 1개 이상 있어야 한다.
 * - ClientEditor의 writableItems[0]이 자동 선택되어 별도 게시판 선택 없이 게시할 수 있다.
 */
test.describe('게시글 수정 후 상세 페이지 리다이렉트', () => {
  test.describe.configure({ mode: 'serial' });

  let clubId: string;
  let testPostId: string;
  let testBoardId: string;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(60_000);
    const context = await browser.newContext({
      storageState: 'e2e/.auth/user.json',
    });
    const page = await context.newPage();

    try {
      clubId = await resolveClubId(page);

      const editor = await openEditor(page, `/${clubId}/board/write`);
      await page.getByPlaceholder('제목').fill('[E2E] 수정 리다이렉트 테스트용 게시글');
      await editor.type('E2E 테스트 자동 생성 게시글입니다.');
      await page.getByRole('button', { name: '게시하기' }).click();

      await page.waitForURL(new RegExp(`/${clubId}/board/\\d+/\\d+`), { timeout: 15_000 });

      const match = new URL(page.url()).pathname.match(/\/board\/(\d+)\/(\d+)$/);
      if (!match) throw new Error(`게시글 생성 후 URL 파싱 실패: ${page.url()}`);
      [, testBoardId, testPostId] = match;
    } finally {
      await context.close().catch(() => {});
    }
  });

  test('수정 완료 후 수정 페이지가 아닌 게시글 상세 페이지로 이동한다', async ({ page }) => {
    await openEditor(page, `/${clubId}/board/edit/${testPostId}?boardId=${testBoardId}`);

    await page.getByPlaceholder('제목').fill('[E2E] 수정 완료된 게시글');
    await page.getByRole('button', { name: '수정 완료' }).click();

    await page.waitForURL(new RegExp(`/${clubId}/board/${testBoardId}/${testPostId}$`), {
      timeout: 10_000,
    });

    expect(page.url()).not.toContain('/edit/');
    expect(page.url()).toMatch(new RegExp(`/${clubId}/board/${testBoardId}/${testPostId}$`));
  });

  test('제목 수정 후 "수정 취소" 클릭 시 이탈 확인 다이얼로그가 표시된다', async ({ page }) => {
    await openEditor(page, `/${clubId}/board/edit/${testPostId}?boardId=${testBoardId}`);

    await page.getByPlaceholder('제목').fill('[E2E] 수정 취소 가드 테스트');
    await page.getByRole('button', { name: '수정 취소' }).click();

    await expect(page.getByText('변경 사항이 저장되지 않았어요')).toBeVisible({ timeout: 5_000 });
  });

  test('수정 완료 후 상세 페이지에서 이탈 확인 다이얼로그가 표시되지 않는다', async ({ page }) => {
    await openEditor(page, `/${clubId}/board/edit/${testPostId}?boardId=${testBoardId}`);

    await page.getByPlaceholder('제목').fill('[E2E] allowNavigation 검증용 수정 게시글');
    await page.getByRole('button', { name: '수정 완료' }).click();

    await page.waitForURL(new RegExp(`/${clubId}/board/${testBoardId}/${testPostId}$`), {
      timeout: 10_000,
    });

    await expect(page.getByText('변경 사항이 저장되지 않았어요')).not.toBeVisible();
  });
});
