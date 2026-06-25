import { test, expect, type Page } from '@playwright/test';

/**
 * 인증된 사용자의 clubId를 동적으로 가져온다.
 *
 * /club/select 페이지는 클럽이 1개이면 서버가 /{clubId}/home으로
 * 자동 리다이렉트하고, 여러 개이면 목록을 표시한다.
 */
async function resolveClubId(page: Page): Promise<string> {
  await page.goto('/club/select');

  // 단일 클럽 → /{clubId}/home 으로 자동 리다이렉트
  await page.waitForURL(/\/\d+\//, { timeout: 10_000 }).catch(() => {});

  const pathMatch = new URL(page.url()).pathname.match(/\/(\d+)\//);
  if (pathMatch) return pathMatch[1];

  // 여러 클럽 → 첫 번째 클럽 링크 href 파싱
  const firstLink = page.locator('a[href*="/home"]').first();
  await firstLink.waitFor({ state: 'visible', timeout: 10_000 });
  const href = (await firstLink.getAttribute('href')) ?? '';
  const hrefMatch = href.match(/\/(\d+)\//);
  if (hrefMatch) return hrefMatch[1];

  throw new Error(
    'clubId를 가져올 수 없습니다.\n' +
      'DEV_ACCESS_TOKEN이 유효하고 가입된 클럽이 있는지 확인하세요.',
  );
}

/**
 * 게시글 작성 페이지로 이동한 뒤 ProseMirror 에디터 Locator를 반환한다.
 *
 * Editor는 dynamic import(ssr:false)로 로드되므로 최대 15초 대기한다.
 * 전제조건: 테스트 계정에 쓰기 가능한 게시판이 1개 이상 있어야 한다.
 */
async function openWriteEditor(page: Page, writeUrl: string) {
  await page.goto(writeUrl);
  const editor = page.locator('.ProseMirror');
  await editor.waitFor({ state: 'visible', timeout: 15_000 });
  await editor.click();
  return editor;
}

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
    const editor = await openWriteEditor(page, writeUrl);

    await page.keyboard.press('Backquote'); // 여는 백틱
    await page.keyboard.type('foo');
    await page.keyboard.press('Backquote'); // 닫는 백틱

    await expect(editor.locator('code')).toHaveText('foo');
  });

  test('빈 H1에서 Backspace 시 paragraph로 전환된다', async ({ page }) => {
    const editor = await openWriteEditor(page, writeUrl);

    // "# " 입력 → Heading InputRule이 H1으로 변환 (입력한 "# "은 제거되고 커서만 남음)
    await page.keyboard.type('# ');
    await expect(editor.locator('h1')).toBeVisible();

    // 빈 H1에서 Backspace → 커스텀 핸들러가 paragraph로 전환
    await page.keyboard.press('Backspace');

    await expect(editor.locator('h1')).not.toBeVisible();
    await expect(editor.locator('p')).toBeVisible();
  });

  test('리스트 뒤 빈 paragraph에서 Backspace 시 리스트로 재진입하지 않는다', async ({ page }) => {
    const editor = await openWriteEditor(page, writeUrl);

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

    // 리스트 뒤에 paragraph가 남아 있지 않아야 한다 (리스트 재진입 방지 확인)
    await expect(paragraphAfterList).not.toBeVisible();
    await expect(editor.locator('ul')).toBeVisible();
    await expect(editor.locator('li')).toContainText('항목1');
  });
});
