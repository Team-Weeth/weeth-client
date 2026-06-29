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
 * 회귀 테스트: 게시글 수정 완료 후 수정 페이지에 잔류하는 버그
 *
 * 전제 조건:
 * - DEV_ACCESS_TOKEN이 유효하고 쓰기 가능한 게시판이 1개 이상 있어야 한다.
 * - ClientEditor의 writableItems[0]이 자동 선택되어 별도 게시판 선택 없이 게시할 수 있다.
 */
test.describe('게시글 수정 후 상세 페이지 리다이렉트', () => {
  let clubId: string;
  let testPostId: string;
  let testBoardId: string;

  test.beforeAll(async ({ browser }) => {
    // 실제 API를 호출하므로 인증 상태를 명시적으로 주입한다
    const context = await browser.newContext({
      storageState: 'e2e/.auth/user.json',
    });
    const page = await context.newPage();

    try {
      clubId = await resolveClubId(page);

      // ── 테스트용 게시글 작성 ──────────────────────────────
      await page.goto(`/${clubId}/board/write`);

      // Editor는 dynamic import(ssr:false)로 로드되므로 최대 15초 대기
      const editor = page.locator('.ProseMirror');
      await editor.waitFor({ state: 'visible', timeout: 15_000 });

      await page.getByPlaceholder('제목').fill('[E2E] 수정 리다이렉트 테스트용 게시글');

      await editor.click();
      await page.keyboard.type('E2E 테스트 자동 생성 게시글입니다.');

      // writableItems[0]이 자동 선택되므로 별도 게시판 선택 없이 게시
      await page.getByRole('button', { name: '게시하기' }).click();

      // 게시 완료 → 상세 페이지로 리다이렉트
      await page.waitForURL(new RegExp(`/${clubId}/board/\\d+/\\d+`), {
        timeout: 15_000,
      });

      // URL에서 boardId, postId 추출
      const match = new URL(page.url()).pathname.match(/\/board\/(\d+)\/(\d+)$/);
      if (!match) {
        throw new Error(`게시글 생성 후 URL 파싱 실패: ${page.url()}`);
      }
      [, testBoardId, testPostId] = match;
    } finally {
      await context.close();
    }
  });

  // ── 정상 흐름 ────────────────────────────────────────────────────────────

  /**
   * 수정 완료 버튼 클릭 → useUpdatePost onSuccess → router.push(buildPostPath(...))
   *
   * 올바른 동작: /{clubId}/board/{boardId}/{postId} 로 리다이렉트
   * 버그 증상 : /board/edit/{postId} URL 에 그대로 잔류
   */
  test('수정 완료 후 수정 페이지가 아닌 게시글 상세 페이지로 이동한다', async ({ page }) => {
    await page.goto(`/${clubId}/board/edit/${testPostId}?boardId=${testBoardId}`);

    const editor = page.locator('.ProseMirror');
    await editor.waitFor({ state: 'visible', timeout: 15_000 });

    // 제목을 수정하여 실제 변경이 발생하도록 함
    await page.getByPlaceholder('제목').fill('[E2E] 수정 완료된 게시글');

    await page.getByRole('button', { name: '수정 완료' }).click();

    // 회귀 검증: 수정 페이지에 잔류하면 waitForURL이 타임아웃으로 실패
    await page.waitForURL(
      new RegExp(`/${clubId}/board/${testBoardId}/${testPostId}$`),
      { timeout: 10_000 },
    );

    expect(page.url()).not.toContain('/edit/');
    expect(page.url()).toMatch(new RegExp(`/${clubId}/board/${testBoardId}/${testPostId}$`));
  });

  // ── 네비게이션 가드 ──────────────────────────────────────────────────────
  //
  // 단위 테스트(useNavigationGuard.test.ts)는 훅 로직만 검증한다.
  // 아래 시나리오는 단위 테스트로 커버 불가한 통합 동작을 검증한다.
  //  1. PostEditorShell의 hasChanges 계산 → enabled 연동이 올바른지
  //  2. AlertDialog의 "나가기"/"계속 작성" 버튼이 onConfirm/onCancel에 연결됐는지
  //  3. useUpdatePost onSuccess의 _allowNavigation?.() 호출 체인이 동작하는지

  test('제목 수정 후 "수정 취소" 클릭 시 이탈 확인 다이얼로그가 표시된다', async ({ page }) => {
    await page.goto(`/${clubId}/board/edit/${testPostId}?boardId=${testBoardId}`);

    const editor = page.locator('.ProseMirror');
    await editor.waitFor({ state: 'visible', timeout: 15_000 });

    // 제목 수정 → snapshot과 달라짐 → hasChanges=true → enabled=true → 가드 활성화
    await page.getByPlaceholder('제목').fill('[E2E] 수정 취소 가드 테스트');

    // "수정 취소" → history.back() → popstate → handlePopState → setOpen(true)
    await page.getByRole('button', { name: '수정 취소' }).click();

    await expect(page.getByText('변경 사항이 저장되지 않았어요')).toBeVisible({ timeout: 5_000 });
  });

  test('수정 완료 후 상세 페이지에서 이탈 확인 다이얼로그가 표시되지 않는다', async ({
    page,
  }) => {
    // _allowNavigation?.() 호출 체인 검증:
    // useUpdatePost onSuccess → store._allowNavigation() → allowNavigation() → isLeaving=true
    // + reset() → hasChanges=false → enabled=false
    await page.goto(`/${clubId}/board/edit/${testPostId}?boardId=${testBoardId}`);

    const editor = page.locator('.ProseMirror');
    await editor.waitFor({ state: 'visible', timeout: 15_000 });

    await page.getByPlaceholder('제목').fill('[E2E] allowNavigation 검증용 수정 게시글');

    await page.getByRole('button', { name: '수정 완료' }).click();
    await page.waitForURL(
      new RegExp(`/${clubId}/board/${testBoardId}/${testPostId}$`),
      { timeout: 10_000 },
    );

    // 상세 페이지에서 가드 다이얼로그가 보이면 안 됨
    await expect(page.getByText('변경 사항이 저장되지 않았어요')).not.toBeVisible();
  });
});
