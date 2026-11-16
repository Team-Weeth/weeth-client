import { act, renderHook } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { useEligibleTour } from '@/hooks/tour/useEligibleTour';
import { DEFAULT_CLUB_FEATURES } from '@/flags/club-features/definitions';
import { useTourStore } from '@/stores/useTourStore';
import { useUserStore } from '@/stores/useUserStore';

import type { TourDefinition } from '@/tours/types';

const FIXTURE_TOUR: TourDefinition<'fixture-tour'> = {
  id: 'fixture-tour',
  version: 1,
  scope: 'main',
  priority: 1,
  match: () => true,
  steps: [{ id: 'step-1', target: '[data-tour="fixture-tour.step-1"]', content: '본문' }],
};

jest.mock('@/tours/registry', () => ({
  ...jest.requireActual('@/tours/registry'),
  listRegisteredTours: () => [FIXTURE_TOUR],
}));

function renderEligibleTour() {
  return renderHook(() =>
    useEligibleTour({ clubId: 'club-1', scope: 'main', features: DEFAULT_CLUB_FEATURES }),
  );
}

beforeEach(() => {
  useTourStore.setState({
    completed: {},
    activeTourId: null,
    suppressors: [],
    hasHydrated: true,
  });
  useUserStore.setState({ id: 1, name: null, profileImageUrl: null, role: 'ADMIN' });
  (usePathname as jest.Mock).mockReturnValue('/club-1/home');
});

describe('useEligibleTour', () => {
  it('hasHydrated가 false면 투어를 반환하지 않는다', () => {
    useTourStore.setState({ hasHydrated: false });

    const { result } = renderEligibleTour();

    expect(result.current).toBeNull();
    expect(useTourStore.getState().activeTourId).toBeNull();
  });

  it('자격을 갖추면 락을 획득하고 투어를 반환한다', () => {
    const { result } = renderEligibleTour();

    expect(result.current?.id).toBe('fixture-tour');
    expect(useTourStore.getState().activeTourId).toBe('fixture-tour');
  });

  it('억제자가 있으면 처음부터 락을 획득하지 않는다', () => {
    useTourStore.setState({ suppressors: ['modal'] });

    const { result } = renderEligibleTour();

    expect(result.current).toBeNull();
    expect(useTourStore.getState().activeTourId).toBeNull();
  });

  it('진행 중에 억제자가 새로 생기면 더 이상 반환하지 않는다 (락 보유 여부와 무관)', () => {
    const { result, rerender } = renderEligibleTour();
    expect(result.current?.id).toBe('fixture-tour');

    act(() => {
      useTourStore.getState().suppress('home-tutorial');
    });
    rerender();

    expect(result.current).toBeNull();
  });
});
