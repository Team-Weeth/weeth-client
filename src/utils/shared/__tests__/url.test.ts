import { toURLSearchParams } from '@/utils/shared/url';

it('배열 값은 같은 키로 반복하고 undefined 값은 뺀다', () => {
  expect(
    toURLSearchParams({
      tab: 'session',
      year: '2026',
      id: ['1', '2'],
      empty: undefined,
    }).toString(),
  ).toBe('tab=session&year=2026&id=1&id=2');
});

it('값이 없으면 빈 쿼리를 만든다', () => {
  expect(toURLSearchParams({}).toString()).toBe('');
});
