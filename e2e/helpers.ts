import { type Page } from '@playwright/test';

/**
 * 인증된 사용자의 clubId를 동적으로 가져온다.
 *
 * 전제 조건: DEV_ACCESS_TOKEN이 유효하고 가입된 클럽이 1개 이상 있어야 한다.
 */
export async function resolveClubId(page: Page): Promise<string> {
  await page.goto('/club/select');
  // 단일 클럽이면 /{clubId}/home 으로 자동 리다이렉트
  await page.waitForURL(/\/[^/]+\/home/, { timeout: 10_000 }).catch(() => {});

  const pathMatch = new URL(page.url()).pathname.match(/^\/([^/]+)\/home/);
  if (pathMatch) return pathMatch[1];

  // 여러 클럽: 목록에서 첫 번째 홈 링크 파싱
  const firstLink = page.locator('a[href*="/home"]').first();
  await firstLink.waitFor({ state: 'visible', timeout: 10_000 });
  const href = (await firstLink.getAttribute('href')) ?? '';
  const hrefMatch = href.match(/^\/([^/]+)\//);
  if (hrefMatch) return hrefMatch[1];

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
