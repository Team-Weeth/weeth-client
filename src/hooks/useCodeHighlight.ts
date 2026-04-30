import { useEffect, type RefObject } from 'react';
import { common, createLowlight } from 'lowlight';
import { toHtml } from 'hast-util-to-html';

const lowlight = createLowlight(common);

/**
 * 렌더링된 코드 블록에 syntax highlighting 적용
 */
function useCodeHighlight(ref: RefObject<HTMLElement | null>, content: string) {
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    container
      .querySelectorAll('pre code[data-highlighted]')
      .forEach((el) => el.removeAttribute('data-highlighted'));

    const codeBlocks = container.querySelectorAll('pre code:not([data-highlighted])');
    codeBlocks.forEach((codeEl) => {
      // 이미 하이라이팅된 경우 skip
      if (codeEl.querySelector('span')) return;

      // 이미 처리된 경우 skip
      if (codeEl.hasAttribute('data-highlighted')) return;

      const text = codeEl.textContent ?? '';
      if (!text.trim()) return;

      const lang = [...codeEl.classList]
        .find((cls) => cls.startsWith('language-'))
        ?.slice('language-'.length);

      let result;

      try {
        result =
          lang && lowlight.registered(lang)
            ? lowlight.highlight(lang, text)
            : lowlight.highlightAuto(text);
      } catch (e) {
        console.error('highlight 실패:', e);
        return;
      }

      const html = toHtml(result);

      if (!html || html.trim() === '') return;

      codeEl.innerHTML = html;
      codeEl.setAttribute('data-highlighted', '');
    });
  }, [ref, content]);
}

export { useCodeHighlight };
