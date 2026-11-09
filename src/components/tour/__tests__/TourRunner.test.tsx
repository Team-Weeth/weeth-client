import { act, render } from '@testing-library/react';
import { EXAMPLE_ADMIN_WARNING_TOUR } from '@/tours/examples/admin-warning.example';
import { TourRunner } from '@/components/tour/TourRunner';
import { mockMatchMedia } from '@/test-utils/browser';
import {
  trackTourCompleted,
  trackTourSkipped,
  trackTourStarted,
  trackTourStepFailed,
  trackTourStepViewed,
} from '@/tours/analytics';

const mockMarkSeen = jest.fn();
const mockFinish = jest.fn();

jest.mock('@/stores', () => ({
  useTourActions: () => ({ markSeen: mockMarkSeen, finish: mockFinish }),
  useUserId: () => 1,
}));

jest.mock('@/tours/analytics', () => ({
  trackTourStarted: jest.fn(),
  trackTourStepViewed: jest.fn(),
  trackTourCompleted: jest.fn(),
  trackTourSkipped: jest.fn(),
  trackTourStepFailed: jest.fn(),
}));

// jsdom에 레이아웃 엔진이 없어 실제 Joyride는 위치/스포트라이트를 계산할 수 없다 — see .claude/rules/tour.md
jest.mock('react-joyride', () => {
  const actual = jest.requireActual('react-joyride');
  const handlers: Record<string, Array<(data: unknown) => void>> = {};
  const controls = { start: jest.fn() };

  const useJoyride = jest.fn(() => ({
    controls,
    Tour: null,
    state: {},
    step: null,
    failures: [],
    on: (eventType: string, handler: (data: unknown) => void) => {
      (handlers[eventType] ??= []).push(handler);
      return () => {
        handlers[eventType] = (handlers[eventType] ?? []).filter((h) => h !== handler);
      };
    },
  }));

  return { ...actual, useJoyride, __mock: { handlers, controls } };
});

function getMock() {
  return jest.requireMock('react-joyride').__mock as {
    handlers: Record<string, Array<(data: unknown) => void>>;
    controls: { start: jest.Mock };
  };
}

function emit(eventType: string, data: unknown) {
  const { handlers } = getMock();
  act(() => {
    (handlers[eventType] ?? []).forEach((handler) => handler(data));
  });
}

beforeEach(() => {
  mockMatchMedia(false);
  const mock = getMock();
  // 참조를 유지해야 on()이 캡처한 handlers 클로저와 emit()이 같은 객체를 본다.
  Object.keys(mock.handlers).forEach((key) => delete mock.handlers[key]);
  mock.controls.start.mockClear();
  mockMarkSeen.mockClear();
  mockFinish.mockClear();
});

describe('TourRunner', () => {
  it('startDelayMs 이후 controls.start를 호출한다', () => {
    jest.useFakeTimers();
    render(<TourRunner clubId="club-1" tour={EXAMPLE_ADMIN_WARNING_TOUR} />);

    expect(getMock().controls.start).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(EXAMPLE_ADMIN_WARNING_TOUR.startDelayMs ?? 0);
    });
    expect(getMock().controls.start).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('TOUR_START 이벤트에서 tour_started를 기록한다', () => {
    render(<TourRunner clubId="club-1" tour={EXAMPLE_ADMIN_WARNING_TOUR} />);

    emit('tour:start', { size: 1 });

    expect(trackTourStarted).toHaveBeenCalledWith(
      expect.objectContaining({ tourId: 'admin-warning', clubId: 'club-1', stepCount: 1 }),
    );
  });

  it('TOOLTIP 이벤트에서 tour_step_viewed를 기록하고, 같은 스텝은 중복 기록하지 않는다', () => {
    render(<TourRunner clubId="club-1" tour={EXAMPLE_ADMIN_WARNING_TOUR} />);

    emit('tooltip', { step: { id: 'type-toggle' }, index: 0 });
    emit('tooltip', { step: { id: 'type-toggle' }, index: 0 });

    expect(trackTourStepViewed).toHaveBeenCalledTimes(1);
  });

  it('TARGET_NOT_FOUND 이벤트에서 tour_step_failed를 기록한다', () => {
    render(<TourRunner clubId="club-1" tour={EXAMPLE_ADMIN_WARNING_TOUR} />);

    emit('error:target_not_found', { step: { id: 'type-toggle' } });

    expect(trackTourStepFailed).toHaveBeenCalledWith(
      expect.objectContaining({ stepId: 'type-toggle', reason: 'target_not_found' }),
    );
  });

  it('TOUR_END(FINISHED)에서 완료를 기록하고 markSeen + finish를 호출한다', () => {
    render(<TourRunner clubId="club-1" tour={EXAMPLE_ADMIN_WARNING_TOUR} />);

    emit('tour:start', { size: 1 });
    emit('tour:end', { status: 'finished', step: { id: 'type-toggle' }, index: 0, origin: null });

    expect(trackTourCompleted).toHaveBeenCalledWith(
      expect.objectContaining({ tourId: 'admin-warning', clubId: 'club-1' }),
    );
    expect(trackTourSkipped).not.toHaveBeenCalled();
    expect(mockMarkSeen).toHaveBeenCalledWith(
      '1:club-1:admin-warning',
      EXAMPLE_ADMIN_WARNING_TOUR.version,
    );
    expect(mockFinish).toHaveBeenCalledTimes(1);
  });

  it('TOUR_END(SKIPPED)에서 스킵을 기록한다', () => {
    render(<TourRunner clubId="club-1" tour={EXAMPLE_ADMIN_WARNING_TOUR} />);

    emit('tour:end', {
      status: 'skipped',
      step: { id: 'type-toggle' },
      index: 0,
      origin: 'button_skip',
    });

    expect(trackTourSkipped).toHaveBeenCalledWith(
      expect.objectContaining({ stepId: 'type-toggle', origin: 'button_skip' }),
    );
    expect(trackTourCompleted).not.toHaveBeenCalled();
    expect(mockFinish).toHaveBeenCalledTimes(1);
  });
});
