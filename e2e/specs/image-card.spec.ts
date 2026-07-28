import { test, expect, type Page } from '@playwright/test';

import { resolveClubId, openEditor } from '../helpers';

/**
 * 전제 조건:
 * - DEV_ACCESS_TOKEN이 유효하고 쓰기 가능한 게시판이 1개 이상 있어야 한다.
 * - presigned URL을 반환하는 백엔드가 필요하다.
 *   (업로드 실패 시 파일이 스토어에서 제거되어 이미지가 사라질 수 있다.)
 *
 * 검증 목적:
 * - className / imgClassName 이 실제로 DOM 요소에 도달하는지는 Jest 단위 테스트로 검증한다.
 * - 이 스펙은 실제 브라우저에서 컨테이너가 잘리거나
 *   지정한 크기대로 렌더링되지 않는 레이아웃 버그를 잡는다.
 */

// PNG 헤더 8바이트 — 에디터 미리보기 확인용 최소 파일
const PNG_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

async function uploadImage(page: Page, filename: string) {
  await expect(page.getByRole('button', { name: '이미지' })).toBeVisible({ timeout: 5_000 });

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: '이미지' }).click(),
  ]);

  await fileChooser.setFiles({ name: filename, mimeType: 'image/png', buffer: PNG_BYTES });

  const img = page.locator(`img[alt="${filename}"]`);
  await img.waitFor({ state: 'visible', timeout: 10_000 });
  return img;
}

test.describe('ImageCard 레이아웃', () => {
  test.describe.configure({ mode: 'serial' });

  let writeUrl: string;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(60_000);
    const context = await browser.newContext({
      storageState: 'e2e/.auth/user.json',
    });
    const page = await context.newPage();
    try {
      writeUrl = `/${await resolveClubId(page)}/board/write`;
    } finally {
      await context.close().catch(() => {});
    }
  });

  test.describe('단일 이미지', () => {
    test('카드가 0이 아닌 크기로 렌더링된다', async ({ page }) => {
      const editor = await openEditor(page, writeUrl);
      await editor.type('/');
      const img = await uploadImage(page, 'single.png');

      const box = await img.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);
    });

    test('래퍼 컨테이너가 최소 높이 182px 이상이다', async ({ page }) => {
      const editor = await openEditor(page, writeUrl);
      await editor.type('/');
      const img = await uploadImage(page, 'single-height.png');

      const containerBox = await img.locator('..').boundingBox();
      expect(containerBox).not.toBeNull();
      expect(containerBox!.height).toBeGreaterThanOrEqual(182);
    });

    test('img가 래퍼 컨테이너 경계 밖으로 벗어나지 않는다', async ({ page }) => {
      const editor = await openEditor(page, writeUrl);
      await editor.type('/');
      const img = await uploadImage(page, 'single-clip.png');

      const imgBox = await img.boundingBox();
      const containerBox = await img.locator('..').boundingBox();
      const t = 1; // 서브픽셀 렌더링 허용 오차

      expect(imgBox!.x).toBeGreaterThanOrEqual(containerBox!.x - t);
      expect(imgBox!.y).toBeGreaterThanOrEqual(containerBox!.y - t);
      expect(imgBox!.x + imgBox!.width).toBeLessThanOrEqual(
        containerBox!.x + containerBox!.width + t,
      );
      expect(imgBox!.y + imgBox!.height).toBeLessThanOrEqual(
        containerBox!.y + containerBox!.height + t,
      );
    });

    test('이미지 카드 스크린샷 비교', async ({ page }) => {
      const editor = await openEditor(page, writeUrl);
      await editor.type('/');
      const img = await uploadImage(page, 'screenshot-single.png');

      await expect(img.locator('..')).toHaveScreenshot('image-card-single.png', {
        maxDiffPixelRatio: 0.05,
        mask: [img], // 이미지 콘텐츠는 마스킹하고 컨테이너 레이아웃만 비교
      });
    });
  });

  test.describe('복수 이미지 (2장)', () => {
    test('스크롤 영역 높이가 182px로 고정된다', async ({ page }) => {
      const editor = await openEditor(page, writeUrl);
      await editor.type('/');
      await uploadImage(page, 'multi-1.png');

      await page.keyboard.press('End');
      await page.keyboard.press('Enter');
      await page.keyboard.type('/');
      await uploadImage(page, 'multi-2.png');

      const scrollArea = page.getByRole('region', { name: '첨부된 이미지 목록' });
      await scrollArea.waitFor({ state: 'visible' });

      const box = await scrollArea.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(181);
      expect(box!.height).toBeLessThanOrEqual(183);
    });

    test('각 img가 스크롤 컨테이너 높이를 벗어나지 않는다', async ({ page }) => {
      const editor = await openEditor(page, writeUrl);
      await editor.type('/');
      await uploadImage(page, 'multi-clip-1.png');

      await page.keyboard.press('End');
      await page.keyboard.press('Enter');
      await page.keyboard.type('/');
      await uploadImage(page, 'multi-clip-2.png');

      const scrollArea = page.getByRole('region', { name: '첨부된 이미지 목록' });
      const containerBox = await scrollArea.boundingBox();
      const t = 1;

      for (const alt of ['multi-clip-1.png', 'multi-clip-2.png']) {
        const imgBox = await page.locator(`img[alt="${alt}"]`).boundingBox();
        expect(imgBox!.y).toBeGreaterThanOrEqual(containerBox!.y - t);
        expect(imgBox!.y + imgBox!.height).toBeLessThanOrEqual(
          containerBox!.y + containerBox!.height + t,
        );
      }
    });

    test('이미지 카드 스크린샷 비교', async ({ page }) => {
      const editor = await openEditor(page, writeUrl);
      await editor.type('/');
      const img1 = await uploadImage(page, 'ss-multi-1.png');

      await page.keyboard.press('End');
      await page.keyboard.press('Enter');
      await page.keyboard.type('/');
      const img2 = await uploadImage(page, 'ss-multi-2.png');

      const scrollArea = page.getByRole('region', { name: '첨부된 이미지 목록' });
      await expect(scrollArea).toHaveScreenshot('image-card-multi.png', {
        maxDiffPixelRatio: 0.05,
        mask: [img1, img2],
      });
    });
  });
});
