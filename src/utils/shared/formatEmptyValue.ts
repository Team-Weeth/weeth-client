import type { ReactNode } from 'react';

/**
 * 비어 있는 값을 '-'로 바꾼다.
 * API의 nullable 필드가 매퍼에서 빈 문자열로 내려오므로 null 체크만으로는 부족하다.
 * 숫자 0은 유효한 값이라 그대로 둔다.
 */
export function formatEmptyValue(value: ReactNode): ReactNode {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string' && !value.trim()) return '-';
  return value;
}
