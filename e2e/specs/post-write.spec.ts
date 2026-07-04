import { test, expect } from '@playwright/test';
import { resolveClubId, openEditor } from '../helpers';

/**
 * 전제 조건:
 * - DEV_ACCESS_TOKEN이 유효하고 쓰기 가능한 게시판이 1개 이상 있어야 한다.
 * - ClientEditor의 writableItems[0]이 자동 선택되어 별도 게시판 선택 없이 게시할 수 있다.
 */
test.describe('게시글 작성', () => {
  let writeUrl: string;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({
      storageState: 'e2e/.auth/user.json',
    });
    const page = await context.newPage();
    try {
      const clubId = await resolveClubId(page);
      writeUrl = `/${clubId}/board/write`;
    } finally {
      await context.close();
    }
  });

  test('제목·내용 작성 후 게시하기 클릭 시 상세 페이지로 이동한다', async ({ page }) => {
    const editor = await openEditor(page, writeUrl);

    await page.getByPlaceholder('제목').fill('[E2E] 게시글 작성 테스트');
    await editor.type('E2E 테스트 본문 내용입니다.');

    await page.getByRole('button', { name: '게시하기' }).click();

    await page.waitForURL(/\/board\/\d+\/\d+$/, { timeout: 15_000 });

    expect(page.url()).not.toContain('/write');
    expect(page.url()).toMatch(/\/board\/\d+\/\d+$/);
  });

  test('제목을 입력하지 않으면 에러 토스트가 표시되고 작성 페이지에 잔류한다', async ({ page }) => {
    const editor = await openEditor(page, writeUrl);

    await editor.type('본문만 입력한 상태입니다.');

    await page.getByRole('button', { name: '게시하기' }).click();

    await expect(page.getByText('제목을 입력해주세요.', { exact: true })).toBeVisible({
      timeout: 5_000,
    });
    expect(page.url()).toContain('/write');
  });

  test('내용을 입력하지 않으면 에러 토스트가 표시되고 작성 페이지에 잔류한다', async ({ page }) => {
    await openEditor(page, writeUrl);

    await page.getByPlaceholder('제목').fill('[E2E] 제목만 입력한 게시글');

    await page.getByRole('button', { name: '게시하기' }).click();

    await expect(page.getByText('내용을 입력해주세요.', { exact: true })).toBeVisible({
      timeout: 5_000,
    });
    expect(page.url()).toContain('/write');
  });

  test('내용 입력 후 "작성 취소" 클릭 시 이탈 확인 다이얼로그가 표시된다', async ({ page }) => {
    await openEditor(page, writeUrl);

    await page.keyboard.type('작성 중인 본문입니다.');

    await page.getByRole('button', { name: '작성 취소' }).click();

    await expect(page.getByText('변경 사항이 저장되지 않았어요')).toBeVisible({ timeout: 5_000 });
  });

  test('"계속 작성" 클릭 시 다이얼로그가 닫히고 작성 페이지에 잔류한다', async ({ page }) => {
    await openEditor(page, writeUrl);
    await page.keyboard.type('작성 중인 본문입니다.');

    await page.getByRole('button', { name: '작성 취소' }).click();
    await expect(page.getByText('변경 사항이 저장되지 않았어요')).toBeVisible({ timeout: 5_000 });

    await page.getByRole('button', { name: '계속 작성' }).click();

    await expect(page.getByText('변경 사항이 저장되지 않았어요')).not.toBeVisible();
    expect(page.url()).toContain('/write');
  });

  test('게시 완료 후 상세 페이지에서 이탈 확인 다이얼로그가 표시되지 않는다', async ({ page }) => {
    const editor = await openEditor(page, writeUrl);
    await page.getByPlaceholder('제목').fill('[E2E] allowNavigation 검증용 게시글');
    await editor.type('_allowNavigation 체인 테스트.');

    await page.getByRole('button', { name: '게시하기' }).click();
    await page.waitForURL(/\/board\/\d+\/\d+$/, { timeout: 15_000 });

    await expect(page.getByText('변경 사항이 저장되지 않았어요')).not.toBeVisible();
  });
});
