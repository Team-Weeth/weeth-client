import { fireEvent, render, screen } from '@testing-library/react';
import { Textarea } from '@/components/ui/Textarea';

/** jsdom은 레이아웃을 계산하지 않으므로 내용 높이(scrollHeight)를 직접 정한다. */
function mockScrollHeight(element: HTMLElement, height: number) {
  Object.defineProperty(element, 'scrollHeight', { configurable: true, value: height });
}

describe('Textarea autoGrow', () => {
  it('내용이 max-height를 넘으면 스크롤할 수 있게 한다', () => {
    render(<Textarea aria-label="입력" autoGrow rows={1} style={{ maxHeight: '120px' }} />);
    const textarea = screen.getByRole('textbox', { name: '입력' });

    mockScrollHeight(textarea, 200);
    fireEvent.change(textarea, { target: { value: '긴 내용' } });

    expect(textarea.style.overflowY).toBe('auto');
  });

  it('내용이 다시 max-height 안으로 줄면 스크롤을 숨긴다', () => {
    render(<Textarea aria-label="입력" autoGrow rows={1} style={{ maxHeight: '120px' }} />);
    const textarea = screen.getByRole('textbox', { name: '입력' });

    mockScrollHeight(textarea, 200);
    fireEvent.change(textarea, { target: { value: '긴 내용' } });
    mockScrollHeight(textarea, 40);
    fireEvent.change(textarea, { target: { value: '짧음' } });

    expect(textarea.style.overflowY).toBe('');
  });

  it('max-height가 없으면 내용만큼 자라고 스크롤하지 않는다', () => {
    render(<Textarea aria-label="입력" autoGrow rows={1} />);
    const textarea = screen.getByRole('textbox', { name: '입력' });

    mockScrollHeight(textarea, 200);
    fireEvent.change(textarea, { target: { value: '긴 내용' } });

    expect(textarea.style.height).toBe('200px');
    expect(textarea.style.overflowY).toBe('');
  });
});
