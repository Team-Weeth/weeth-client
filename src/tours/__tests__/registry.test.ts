import { listRegisteredTours, getTourSeenKey, TOUR_REGISTRY } from '@/tours/registry';

import type { TourDefinition } from '@/tours/types';

describe('TOUR_REGISTRY', () => {
  it('아직 등록된 투어가 없다 — 첫 실제 투어가 "Adding a Tour" 절차로 여기 추가된다', () => {
    expect(listRegisteredTours()).toHaveLength(0);
  });

  // 지금은 0회 반복되어 통과하지만, 투어가 하나라도 등록되면 그 순간부터 실제로 검증한다 —
  // 등록 시점에 이 블록을 "다시 채워 넣어야 한다"는 걸 기억할 필요가 없도록.
  describe('등록된 각 투어의 불변식', () => {
    const entries = Object.entries(TOUR_REGISTRY) as Array<[string, TourDefinition]>;
    const tours = entries.map(([, tour]) => tour);

    it('키와 id가 일치한다', () => {
      entries.forEach(([key, tour]) => {
        expect(tour.id).toBe(key);
      });
    });

    it('priority가 레지스트리 전체에서 유일하다', () => {
      const priorities = tours.map((tour) => tour.priority);
      expect(new Set(priorities).size).toBe(priorities.length);
    });

    it('version이 1 이상이다', () => {
      tours.forEach((tour) => {
        expect(tour.version).toBeGreaterThanOrEqual(1);
      });
    });

    it('스텝 id가 투어 내에서 유일하다', () => {
      tours.forEach((tour) => {
        const ids = tour.steps.map((step) => step.id);
        expect(new Set(ids).size).toBe(ids.length);
      });
    });

    it('모든 step.target은 tourSelector(`${투어id}.<step>`) 형태다', () => {
      tours.forEach((tour) => {
        tour.steps.forEach((step) => {
          expect(typeof step.target).toBe('string');
          expect(step.target as string).toMatch(
            new RegExp(`^\\[data-tour="${tour.id}\\.[^"]+"\\]$`),
          );
        });
      });
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
