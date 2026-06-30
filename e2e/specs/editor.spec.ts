import { test, expect } from '@playwright/test';
import { resolveClubId, openEditor } from '../helpers';

test.describe('에디터 키보드 단축키', () => {
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

  test('백틱으로 인라인 코드를 생성한다', async ({ page }) => {
    const editor = await openEditor(page, writeUrl);

    await page.keyboard.press('Backquote'); // 여는 백틱
    await page.keyboard.type('foo');
    await page.keyboard.press('Backquote'); // 닫는 백틱

    await expect(editor.locator('code')).toHaveText('foo');
  });

  test('빈 H1에서 Backspace 시 paragraph로 전환된다', async ({ page }) => {
    const editor = await openEditor(page, writeUrl);

    // "# " 입력 → Heading InputRule이 H1으로 변환 (입력한 "# "은 제거되고 커서만 남음)
    await page.keyboard.type('# ');
    await expect(editor.locator('h1')).toBeVisible();

    await page.keyboard.press('Backspace');

    await expect(editor.locator('h1')).not.toBeVisible();
    await expect(editor.locator('p')).toBeVisible();
  });

  test('리스트 뒤 빈 paragraph에서 Backspace 시 리스트로 재진입하지 않는다', async ({ page }) => {
    const editor = await openEditor(page, writeUrl);

    // "- 항목1" → 불릿 리스트 생성
    await page.keyboard.type('- 항목1');
    // 첫 Enter → 새 빈 리스트 항목 생성
    await page.keyboard.press('Enter');
    // 두 번째 Enter → 빈 리스트 항목 lift → 리스트 뒤 빈 paragraph 생성
    await page.keyboard.press('Enter');

    await expect(editor.locator('ul')).toBeVisible();
    const paragraphAfterList = editor.locator('ul ~ p');
    await expect(paragraphAfterList).toBeVisible();

    // Backspace → 커스텀 핸들러: 빈 paragraph 삭제, 커서를 리스트 끝으로 이동
    await page.keyboard.press('Backspace');

    await expect(paragraphAfterList).not.toBeVisible();
    await expect(editor.locator('ul')).toBeVisible();
    await expect(editor.locator('li')).toContainText('항목1');
  });
});
