import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

/** 화면 상태는 data-* 속성으로 읽는다. 값은 서버가 확정한 위치·상태다. */
async function game(page: Page) {
  return page
    .getByTestId('wax-game')
    .evaluate((element) => ({ ...(element as HTMLElement).dataset }));
}

async function enter(page: Page, url = '/play/wax') {
  await page.goto(url);
  await page.getByRole('button', { name: '소리 켜고 입장하기' }).click();
  await expect(page.getByTestId('wax-game')).toHaveAttribute('data-ready', 'true', {
    timeout: 20000,
  });
  await expect(page.getByTestId('wax-game')).toHaveAttribute('data-status', 'walking');
}

/** 카메라 기본 방향(복도에서 강의실 쪽을 봄) 기준으로 키를 누른 채 조건을 기다린다. */
async function holdUntil(
  page: Page,
  key: string,
  done: (state: Record<string, string | undefined>) => boolean,
  limit = 8000,
) {
  await page.keyboard.down(key);
  const start = Date.now();
  try {
    while (Date.now() - start < limit) {
      if (done(await game(page))) return;
      await page.waitForTimeout(30);
    }
    throw new Error(`${key} 이동이 끝나지 않았어요: ${JSON.stringify(await game(page))}`);
  } finally {
    await page.keyboard.up(key);
    await page.waitForTimeout(150);
  }
}

/** 복도에서 102호 문(x≈4.25)까지 걸어간 뒤 문을 지나 교실로 들어간다. */
async function walkIntoRoom(page: Page) {
  // 벽에 붙어 있으면 복도 쪽 사물함에 걸리므로 먼저 복도 가운데로 물러난다.
  if (Number((await game(page)).z) < 1.2)
    await holdUntil(page, 'KeyS', (state) => Number(state.z) >= 1.4);
  const { x } = await game(page);
  if (Number(x) < 4.15) await holdUntil(page, 'KeyD', (state) => Number(state.x) >= 4.15);
  await holdUntil(page, 'KeyA', (state) => Number(state.x) <= 4.4);
  await holdUntil(page, 'KeyW', (state) => state.room === '2' && Number(state.z) < -1);
}

test('로그인 없이 게임 소개와 입장 버튼을 보여준다', async ({ page }) => {
  await page.goto('/play/wax');
  await expect(page.getByRole('heading', { name: '교수님 몰래 왁뿌볼' })).toBeVisible();
  await expect(page.getByRole('button', { name: '소리 켜고 입장하기' })).toBeEnabled({
    timeout: 20000,
  });
  await expect(page).toHaveURL(/\/play\/wax/);
});

test('벽은 통과하지 못하고 문으로 걸어 들어가야 강의실이 된다', async ({ page }) => {
  await enter(page);
  const start = await game(page);
  // 문이 없는 곳에서 벽 쪽으로 걸으면 복도에 남는다.
  await holdUntil(page, 'KeyA', (state) => Number(state.x) <= Number(start.x) - 2.5);
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(2200);
  await page.keyboard.up('KeyW');
  expect((await game(page)).room).toBe('0');
  await walkIntoRoom(page);
  expect((await game(page)).room).toBe('2');
  await expect(page.getByRole('button', { name: /앉아서 왁뿌볼 깨기/ })).toBeVisible();
});

test('같은 월드의 두 사람: 착석·깨기·적발·문 앞 퇴장이 서로 보인다', async ({ browser }) => {
  test.setTimeout(120000);
  const a = await browser.newContext();
  const b = await browser.newContext();
  const actor = await a.newPage();
  const watcher = await b.newPage();
  try {
    await enter(actor);
    const { world } = await game(actor);
    expect(world).toBeTruthy();
    await enter(watcher, `/play/wax?world=${world}`);
    await expect(watcher.getByTestId('wax-game')).toHaveAttribute('data-world', world!);

    await walkIntoRoom(actor);
    await actor.keyboard.press('KeyE');
    await expect(actor.getByTestId('wax-game')).toHaveAttribute('data-status', 'seated');
    await expect(actor.getByRole('button', { name: /꾹 누르기/ })).toBeVisible();

    // 계속 누르면 깨지다가 들킨다.
    await actor.keyboard.down('Space');
    await expect
      .poll(async () => Number((await game(actor)).layer), { timeout: 10000 })
      .toBeGreaterThan(0);
    await expect
      .poll(
        async () => {
          const state = await game(actor);
          if (state.status === 'seated') await actor.keyboard.down('Space');
          return state.caughts;
        },
        { timeout: 25000, intervals: [200] },
      )
      .toBe('1');
    await actor.keyboard.up('Space');

    const after = await game(actor);
    expect(after.room).toBe('0');
    expect(after.status).toBe('walking');
    expect(Number(after.x)).toBeCloseTo(4.25, 1);
    expect(Number(after.z)).toBeCloseTo(1.4, 1);
    await expect(watcher.getByText(/님이 102호에서 쫓겨났어요/)).toBeVisible();
    await actor.getByRole('button', { name: '도움말' }).click();
    await expect(actor.getByRole('link', { name: 'Weeth 알아보기' })).toHaveAttribute(
      'href',
      /landing.*utm_source=wax/,
    );
  } finally {
    await a.close();
    await b.close();
  }
});

test('형식이 틀린 초대 링크는 거절하고 새 교실로 다시 입장할 수 있다', async ({ page }) => {
  await page.goto('/play/wax?world=expired-classroom');
  await page.getByRole('button', { name: '소리 켜고 입장하기' }).click();
  await expect(page.getByText('잘못된 초대 링크예요').first()).toBeVisible();
  await page.getByRole('button', { name: '다시 입장하기' }).click();
  await expect(page.getByTestId('wax-game')).toHaveAttribute('data-ready', 'true', {
    timeout: 20000,
  });
});

test('닫힌 초대 링크로 들어오면 같은 교실 id로 다시 열린다', async ({ page }) => {
  const worldId = `e2e${Date.now().toString(36).slice(-5)}`;
  await enter(page, `/play/wax?world=${worldId}`);
  await expect(page.getByTestId('wax-game')).toHaveAttribute('data-world', worldId);
});

test('banks.json의 녹음 파일(실제 왁뿌볼 녹음 12개 포함)을 브라우저가 모두 디코딩한다', async ({
  page,
}) => {
  await page.goto('/play/wax');
  const result = await page.evaluate(async () => {
    const manifest = await (await fetch('/audio/wax/banks.json')).json();
    const files: string[] = [
      ...Object.values(manifest.banks as Record<string, string | string[]>).flat(),
      ...manifest.whack,
      manifest.ambience.classroom,
      manifest.ambience.hallway,
      manifest.chalk,
    ];
    const context = new AudioContext();
    try {
      return await Promise.all(
        files.map(async (file) => {
          const response = await fetch(`/audio/wax/${file}`);
          if (!response.ok) throw new Error(`${file}: ${response.status}`);
          const buffer = await context.decodeAudioData(await response.arrayBuffer());
          const samples = buffer.getChannelData(0);
          let energy = 0;
          for (const sample of samples) energy += sample * sample;
          return { file, duration: buffer.duration, rms: Math.sqrt(energy / samples.length) };
        }),
      );
    } finally {
      await context.close();
    }
  });
  expect(result.length).toBeGreaterThanOrEqual(17);
  // 왁뿌볼 소리는 apple77771/wakppuball-simulator의 실제 녹음(CC BY 4.0)이다.
  expect(result.filter((recording) => recording.file.startsWith('wakppu/'))).toHaveLength(12);
  for (const recording of result) {
    expect(recording.duration, recording.file).toBeGreaterThan(0.3);
    expect(recording.rms, recording.file).toBeGreaterThan(0.001);
  }
});

test('모바일에서 가로 넘침 없이 조이스틱으로 걷는다', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  try {
    await page.goto('/play/wax');
    await page.getByRole('button', { name: '소리 켜고 입장하기' }).tap();
    await expect(page.getByTestId('wax-game')).toHaveAttribute('data-ready', 'true', {
      timeout: 20000,
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
    const stick = page.getByLabel('이동 조이스틱');
    await expect(stick).toBeVisible();
    const before = await game(page);
    const box = (await stick.boundingBox())!;
    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    // 조이스틱을 위로 밀면 앞으로(강의실 쪽, -z) 걷는다.
    await stick.dispatchEvent('pointerdown', {
      pointerId: 7,
      clientX: center.x,
      clientY: center.y,
      bubbles: true,
    });
    await stick.dispatchEvent('pointermove', {
      pointerId: 7,
      clientX: center.x,
      clientY: center.y - 40,
      bubbles: true,
    });
    await expect
      .poll(async () => Number((await game(page)).z), { timeout: 5000 })
      .toBeLessThan(Number(before.z) - 0.5);
    await stick.dispatchEvent('pointerup', { pointerId: 7, bubbles: true });
  } finally {
    await context.close();
  }
});
