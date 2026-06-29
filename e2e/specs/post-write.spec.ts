import { test, expect, type Page } from '@playwright/test';

/**
 * 인증된 사용자의 clubId를 동적으로 가져온다.
 * /club/select 가 클럽이 1개이면 /{clubId}/home 으로 자동 리다이렉트,
 * 여러 개이면 목록을 표시한다.
 */
async function resolveClubId(page: Page): Promise<string> {
  await page.goto('/club/select');
  await page.waitForURL(/\/\d+\//, { timeout: 10_000 }).catch(() => {});

  const pathMatch = new URL(page.url()).pathname.match(/\/(\d+)\//);
  if (pathMatch) return pathMatch[1];

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
 * Editor는 dynamic import(ssr:false)로 로드되므로 최대 15초 대기한다.
 * 전제 조건: 테스트 계정에 쓰기 가능한 게시판이 1개 이상 있어야 한다.
 */
async function openWriteEditor(page: Page, writeUrl: string) {
  await page.goto(writeUrl);
  const editor = page.locator('.ProseMirror');
  await editor.waitFor({ state: 'visible', timeout: 15_000 });
  await editor.click();
  return editor;
}

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

  // ── 정상 흐름 ────────────────────────────────────────────────────────────

  test('제목·내용 작성 후 게시하기 클릭 시 상세 페이지로 이동한다', async ({ page }) => {
    const editor = await openWriteEditor(page, writeUrl);

    await page.getByPlaceholder('제목').fill('[E2E] 게시글 작성 테스트');
    await editor.type('E2E 테스트 본문 내용입니다.');

    await page.getByRole('button', { name: '게시하기' }).click();

    // 작성 완료 → 상세 페이지 /{clubId}/board/{boardId}/{postId} 로 이동
    await page.waitForURL(/\/board\/\d+\/\d+$/, { timeout: 15_000 });

    expect(page.url()).not.toContain('/write');
    expect(page.url()).toMatch(/\/board\/\d+\/\d+$/);
  });

  // ── 유효성 검사 ──────────────────────────────────────────────────────────

  test('제목을 입력하지 않으면 에러 토스트가 표시되고 작성 페이지에 잔류한다', async ({
    page,
  }) => {
    const editor = await openWriteEditor(page, writeUrl);

    // 내용만 입력하고 제목은 비워 둠
    await editor.type('본문만 입력한 상태입니다.');

    await page.getByRole('button', { name: '게시하기' }).click();

    // validatePost: title.trim() === '' → '제목을 입력해주세요.' 에러 토스트
    await expect(page.getByText('제목을 입력해주세요.')).toBeVisible({ timeout: 5_000 });
    expect(page.url()).toContain('/write');
  });

  test('내용을 입력하지 않으면 에러 토스트가 표시되고 작성 페이지에 잔류한다', async ({
    page,
  }) => {
    await openWriteEditor(page, writeUrl);

    // 제목만 입력하고 본문은 비워 둠
    await page.getByPlaceholder('제목').fill('[E2E] 제목만 입력한 게시글');

    await page.getByRole('button', { name: '게시하기' }).click();

    // validatePost: isHtmlEmpty(content) → '내용을 입력해주세요.' 에러 토스트
    await expect(page.getByText('내용을 입력해주세요.')).toBeVisible({ timeout: 5_000 });
    expect(page.url()).toContain('/write');
  });

  // ── 네비게이션 가드 ──────────────────────────────────────────────────────
  //
  // 단위 테스트(useNavigationGuard.test.ts)는 훅 로직만 검증한다.
  // 아래 시나리오는 단위 테스트로 커버 불가한 통합 동작을 검증한다.
  //  1. PostEditorShell의 hasChanges 계산 → enabled 연동이 올바른지
  //  2. AlertDialog의 "나가기"/"계속 작성" 버튼이 onConfirm/onCancel에 연결됐는지
  //  3. useCreatePost onSuccess의 _allowNavigation?.() 호출 체인이 동작하는지

  test('내용 입력 후 "작성 취소" 클릭 시 이탈 확인 다이얼로그가 표시된다', async ({ page }) => {
    const editor = await openWriteEditor(page, writeUrl);

    // 본문 입력 → hasChanges=true (hasText=true) → enabled=true → 가드 활성화
    await page.keyboard.type('작성 중인 본문입니다.');

    // "작성 취소" → history.back() → popstate → handlePopState → setOpen(true)
    await page.getByRole('button', { name: '작성 취소' }).click();

    await expect(page.getByText('변경 사항이 저장되지 않았어요')).toBeVisible({ timeout: 5_000 });
  });

  test('"계속 작성" 클릭 시 다이얼로그가 닫히고 작성 페이지에 잔류한다', async ({ page }) => {
    const editor = await openWriteEditor(page, writeUrl);
    await page.keyboard.type('작성 중인 본문입니다.');

    await page.getByRole('button', { name: '작성 취소' }).click();
    await expect(page.getByText('변경 사항이 저장되지 않았어요')).toBeVisible({ timeout: 5_000 });

    // onCancel → setOpen(false) + guard entry 복원
    await page.getByRole('button', { name: '계속 작성' }).click();

    await expect(page.getByText('변경 사항이 저장되지 않았어요')).not.toBeVisible();
    expect(page.url()).toContain('/write');
  });

  test('게시 완료 후 상세 페이지에서 이탈 확인 다이얼로그가 표시되지 않는다', async ({
    page,
  }) => {
    // _allowNavigation?.() 호출 체인 검증:
    // useCreatePost onSuccess → store._allowNavigation() → allowNavigation() → isLeaving=true
    // + reset() → hasChanges=false → enabled=false
    const editor = await openWriteEditor(page, writeUrl);
    await page.getByPlaceholder('제목').fill('[E2E] allowNavigation 검증용 게시글');
    await page.keyboard.type('_allowNavigation 체인 테스트.');

    await page.getByRole('button', { name: '게시하기' }).click();
    await page.waitForURL(/\/board\/\d+\/\d+$/, { timeout: 15_000 });

    // 상세 페이지에서 가드 다이얼로그가 보이면 안 됨
    await expect(page.getByText('변경 사항이 저장되지 않았어요')).not.toBeVisible();
  });
});
