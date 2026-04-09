/**
 * Tiptap HTML 콘텐츠가 비어있는지 확인
 * 빈 에디터는 `<p></p>` 같은 빈 태그를 반환하므로 trim()으로는 감지 불가
 */
export function isHtmlEmpty(html: string): boolean {
  const text = html.replace(/<[^>]*>/g, '').trim();
  return text.length === 0;
}
