import { formatEmptyValue } from '@/utils/shared/formatEmptyValue';

it.each([null, undefined, '', '   '])('빈 값 %p은 -로 바꾼다', (value) => {
  expect(formatEmptyValue(value)).toBe('-');
});

it.each([0, '0', '개발', ' 개발 '])('값이 있으면 %p을 그대로 둔다', (value) => {
  expect(formatEmptyValue(value)).toBe(value);
});
