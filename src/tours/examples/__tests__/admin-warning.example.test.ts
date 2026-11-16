import { CLUB_FEATURE_FLAGS } from '@/flags/club-features/definitions';
import {
  EXAMPLE_ADMIN_WARNING_TARGETS,
  EXAMPLE_ADMIN_WARNING_TOUR,
} from '@/tours/examples/admin-warning.example';

/**
 * This tour is never registered in TOUR_REGISTRY — these tests only guard that the reference
 * example itself keeps following the .claude/rules/tour.md pattern over time.
 */
describe('EXAMPLE_ADMIN_WARNING_TOUR — 패턴 불변식', () => {
  it('version이 1 이상이다', () => {
    expect(EXAMPLE_ADMIN_WARNING_TOUR.version).toBeGreaterThanOrEqual(1);
  });

  it('requiresFeature는 실제 ClubFeatures의 키다', () => {
    expect(Object.keys(CLUB_FEATURE_FLAGS)).toContain(EXAMPLE_ADMIN_WARNING_TOUR.requiresFeature);
  });

  it('스텝 id가 투어 내에서 유일하다', () => {
    const ids = EXAMPLE_ADMIN_WARNING_TOUR.steps.map((step) => step.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('모든 step.target은 자신의 타깃 맵에서 나온 tourSelector(`${투어id}.<step>`) 형태다', () => {
    const targetValues = Object.values(EXAMPLE_ADMIN_WARNING_TARGETS);

    EXAMPLE_ADMIN_WARNING_TOUR.steps.forEach((step) => {
      expect(typeof step.target).toBe('string');
      const targetId = (step.target as string).match(/^\[data-tour="(.+)"\]$/)?.[1];
      expect(targetId).toBeDefined();
      expect(targetValues).toContain(targetId);
      expect(targetId).toMatch(new RegExp(`^${EXAMPLE_ADMIN_WARNING_TOUR.id}\\.`));
    });
  });
});
