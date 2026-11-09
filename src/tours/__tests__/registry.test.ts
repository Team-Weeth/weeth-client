import { listRegisteredTours, getTourSeenKey, TOUR_REGISTRY } from '@/tours/registry';

import type { TourDefinition } from '@/tours/types';

describe('TOUR_REGISTRY', () => {
  it('아직 등록된 투어가 없다 — 첫 실제 투어가 "Adding a Tour" 절차로 여기 추가된다', () => {
    expect(listRegisteredTours()).toHaveLength(0);
  });

  it('키와 id가 일치한다 (투어가 추가되면 적용)', () => {
    const entries = Object.entries(TOUR_REGISTRY) as Array<[string, TourDefinition]>;
    entries.forEach(([key, tour]) => {
      expect(tour.id).toBe(key);
    });
  });
});

describe('getTourSeenKey', () => {
  it('userId:clubId:tourId 형태를 만든다', () => {
    expect(getTourSeenKey(1, 'club-1', 'admin-warning')).toBe('1:club-1:admin-warning');
  });

  it('userId가 null이면 anonymous로 대체한다', () => {
    expect(getTourSeenKey(null, 'club-1', 'admin-warning')).toBe('anonymous:club-1:admin-warning');
  });
});

describe('런타임 react-joyride import 가드', () => {
  it('react-joyride를 import하지 않고도 로드된다', async () => {
    jest.resetModules();
    jest.doMock('react-joyride', () => {
      throw new Error('src/tours/** must not import react-joyride at runtime');
    });

    await expect(import('@/tours/registry')).resolves.toBeDefined();

    jest.dontMock('react-joyride');
    jest.resetModules();
  });
});
