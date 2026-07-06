import { type Page } from '@playwright/test';

/**
 * 인증된 사용자의 clubId를 동적으로 가져온다.
 *
 * 전제 조건: DEV_ACCESS_TOKEN이 유효하고 가입된 클럽이 1개 이상 있어야 한다.
 */
export async function resolveClubId(page: Page): Promise<string> {
  const clubIdFromUrl = () => new URL(page.url()).pathname.match(/^\/([^/]+)\/home/)?.[1];

  await page.goto('/club/select');

  // 단일 클럽이면 서버가 리다이렉트, 복수 클럽이면 버튼이 렌더된다.
  // 두 조건을 경쟁시켜 먼저 충족되는 쪽으로 분기한다.
  const firstButton = page.getByRole('button', { name: '바로가기' }).first();
  await Promise.race([
    page.waitForURL(/\/[^/]+\/home/, { timeout: 40_000 }),
    firstButton.waitFor({ state: 'visible', timeout: 40_000 }),
  ]).catch(() => {});

  const singleClubId = clubIdFromUrl();
  if (singleClubId) return singleClubId;

  // ClubList는 router.push()를 사용하므로 <a href> 대신 버튼을 직접 클릭한다.
  await firstButton.click();
  await page.waitForURL(/\/[^/]+\/home/, { timeout: 15_000 });

  const multiClubId = clubIdFromUrl();
  if (multiClubId) return multiClubId;

  throw new Error(
    'clubId를 가져올 수 없습니다.\n' +
      'DEV_ACCESS_TOKEN이 유효하고 가입된 클럽이 있는지 확인하세요.',
  );
}

/**
 * E2E 테스트 중 생성된 게시글을 정리한다.
 * afterAll에서 호출하며, 실패해도 테스트 결과에 영향을 주지 않는다.
 */
export async function deletePost(clubId: string, boardId: string, postId: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://api-dev.v4.weeth.kr';
  const token = process.env.DEV_ACCESS_TOKEN;
  if (!token) return;
  await fetch(`${baseUrl}/clubs/${clubId}/boards/${boardId}/posts/${postId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
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
