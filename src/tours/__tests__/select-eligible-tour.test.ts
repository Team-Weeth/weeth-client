import { EXAMPLE_ADMIN_WARNING_TOUR } from '@/tours/examples/admin-warning.example';
import { selectEligibleTour, type SelectEligibleTourInput } from '@/tours/registry';

import type { Role } from '@/types/user';

// 테스트 전용 fixture — EXAMPLE_ADMIN_WARNING_TOUR는 TOUR_REGISTRY에 등록돼 있지 않으므로
// selectEligibleTour에 직접 후보 목록으로 넘긴다 (실제 호출자인 useEligibleTour는
// Object.values(TOUR_REGISTRY)를 넘긴다).
const tours = [EXAMPLE_ADMIN_WARNING_TOUR];

// EXAMPLE_ADMIN_WARNING_TOUR 기준: scope 'admin', match '*/admin/penalty', roles ['ADMIN','LEAD'],
// requiresFeature 'warningEnabled', version 1.
function buildInput(overrides: Partial<SelectEligibleTourInput> = {}): SelectEligibleTourInput {
  return {
    scope: 'admin',
    pathname: '/club-1/admin/penalty',
    role: 'ADMIN' as Role,
    features: { warningEnabled: true },
    completed: {},
    isSuppressed: false,
    seenKeyFor: (tourId) => `seen:${tourId}`,
    ...overrides,
  };
}

describe('selectEligibleTour — Gating Matrix', () => {
  it('모든 게이트를 통과하면 admin-warning을 반환한다', () => {
    expect(selectEligibleTour(tours, buildInput())?.id).toBe('admin-warning');
  });

  it('억제자가 있으면 null을 반환한다', () => {
    expect(selectEligibleTour(tours, buildInput({ isSuppressed: true }))).toBeNull();
  });

  it('scope가 다르면 null을 반환한다', () => {
    expect(selectEligibleTour(tours, buildInput({ scope: 'main' }))).toBeNull();
  });

  it('라우트가 일치하지 않으면 null을 반환한다', () => {
    expect(selectEligibleTour(tours, buildInput({ pathname: '/club-1/admin/member' }))).toBeNull();
  });

  it('role이 null이면 null을 반환한다', () => {
    expect(selectEligibleTour(tours, buildInput({ role: null }))).toBeNull();
  });

  it('허용되지 않은 role이면 null을 반환한다', () => {
    expect(selectEligibleTour(tours, buildInput({ role: 'USER' as Role }))).toBeNull();
  });

  it('허용된 다른 role(LEAD)이면 반환한다', () => {
    expect(selectEligibleTour(tours, buildInput({ role: 'LEAD' as Role }))?.id).toBe(
      'admin-warning',
    );
  });

  it('피처 플래그가 꺼져 있으면 null을 반환한다', () => {
    expect(
      selectEligibleTour(tours, buildInput({ features: { warningEnabled: false } })),
    ).toBeNull();
  });

  it('현재 버전으로 이미 봤으면 null을 반환한다', () => {
    expect(
      selectEligibleTour(tours, buildInput({ completed: { 'seen:admin-warning': 1 } })),
    ).toBeNull();
  });

  it('더 낮은 버전으로 봤다면(버전 올라감) 다시 반환한다', () => {
    expect(
      selectEligibleTour(tours, buildInput({ completed: { 'seen:admin-warning': 0 } }))?.id,
    ).toBe('admin-warning');
  });
});
