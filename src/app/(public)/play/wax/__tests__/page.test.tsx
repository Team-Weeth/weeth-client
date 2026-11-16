/** @jest-environment node */

import WaxPage from '../page';
import { WaxGame } from '@/components/minigame/wax/WaxGame';
import { WaxPaused } from '@/components/minigame/wax/WaxPaused';
import { isWaxEnabled } from '@/flags/wax/server';

jest.mock('@/flags/wax/server', () => ({ isWaxEnabled: jest.fn() }));
jest.mock('@/components/minigame/wax/WaxGame', () => ({ WaxGame: () => null }));

describe('/play/wax 운영 스위치', () => {
  it('wax_enabled가 꺼져 있으면 게임 대신 쉬는 시간 화면을 보여준다', async () => {
    jest.mocked(isWaxEnabled).mockResolvedValue(false);
    expect((await WaxPage()).type).toBe(WaxPaused);
  });

  it('켜져 있으면 게임을 보여준다', async () => {
    jest.mocked(isWaxEnabled).mockResolvedValue(true);
    expect((await WaxPage()).type).toBe(WaxGame);
  });
});
