/** "1, 2, 3" 형태의 활동기수 문자열을 정규화된 배열로 변환 */
export function parseCardinals(raw: string): string[] {
  return raw
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
}
