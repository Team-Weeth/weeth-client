import { type Page } from '@playwright/test';

/**
 * 인증된 사용자의 clubId를 동적으로 가져온다.
 *
 * 전제 조건: DEV_ACCESS_TOKEN이 유효하고 가입된 클럽이 1개 이상 있어야 한다.
 * CI 환경에서 pnpm dev cold start 지연을 감안해 리다이렉트를 최대 30초 대기한다.
 */
export async function resolveClubId(page: Page): Promise<string> {
  const clubIdFromUrl = () => new URL(page.url()).pathname.match(/^\/([^/]+)\/home/)?.[1];

  await page.goto('/club/select');
  await page.waitForURL(/\/[^/]+\/home/, { timeout: 30_000 }).catch(() => {});

  const singleClubId = clubIdFromUrl();
  if (singleClubId) return singleClubId;

  // ClubList는 router.push()를 사용하므로 <a href> 대신 버튼을 직접 클릭한다.
  const firstButton = page.getByRole('button', { name: '바로가기' }).first();
  await firstButton.waitFor({ state: 'visible', timeout: 10_000 });
  await firstButton.click();
  await page.waitForURL(/\/[^/]+\/home/, { timeout: 10_000 });

  const multiClubId = clubIdFromUrl();
  if (multiClubId) return multiClubId;

  throw new Error(
    'clubId를 가져올 수 없습니다.\n' +
      'DEV_ACCESS_TOKEN이 유효하고 가입된 클럽이 있는지 확인하세요.',
  );
}

/**
 * 게시글 작성/수정 페이지로 이동한 뒤 ProseMirror 에디터 Locator를 반환한다.
 * Editor는 dynamic import(ssr:false)로 로드되므로 최대 15초 대기한다.
 */
export async function openEditor(page: Page, url: string) {
  await page.goto(url);
  const editor = page.locator('.ProseMirror');
  await editor.waitFor({ state: 'visible', timeout: 15_000 });
  await editor.click();
  return editor;
}
