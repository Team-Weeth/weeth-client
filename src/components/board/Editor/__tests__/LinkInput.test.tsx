import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LinkInput } from '@/components/board/Editor/LinkInput';

// ── @tiptap/core: getMarkRange만 mock ─────────────
jest.mock('@tiptap/core', () => ({
  ...jest.requireActual('@tiptap/core'),
  getMarkRange: jest.fn(),
}));

const { getMarkRange } = jest.requireMock('@tiptap/core') as {
  getMarkRange: jest.Mock;
};

// ── useClickOutside mock ──────────────────────────
jest.mock('@/hooks/useClickOutside', () => ({
  useClickOutside: jest.fn(),
}));

const { useClickOutside } = jest.requireMock('@/hooks/useClickOutside') as {
  useClickOutside: jest.Mock;
};

// ── chain mock factory ────────────────────────────
function createChainMock() {
  const chain: Record<string, jest.Mock> = {};
  ['focus', 'extendMarkRange', 'setLink', 'unsetLink', 'insertContent', 'run'].forEach((m) => {
    chain[m] = jest.fn(() => chain);
  });
  return chain;
}

// ── editor mock factory ───────────────────────────
interface MockEditorOptions {
  href?: string;
  selectedText?: string;
  isEditing?: boolean;
  empty?: boolean;
  linkRangeText?: string;
}

function createMockEditor(options: MockEditorOptions = {}) {
  const {
    href = '',
    selectedText = '',
    isEditing = false,
    empty = true,
    linkRangeText = '',
  } = options;

  const chain = createChainMock();
  const $from = {};

  getMarkRange.mockReturnValue(linkRangeText ? { from: 0, to: linkRangeText.length } : null);

  const editor = {
    getAttributes: jest.fn().mockReturnValue({ href }),
    isActive: jest.fn().mockReturnValue(isEditing),
    chain: jest.fn().mockReturnValue(chain),
    state: {
      selection: { from: 0, to: selectedText.length, empty, $from },
      doc: {
        textBetween: jest.fn().mockImplementation((from: number, to: number) => {
          if (from === 0 && to === selectedText.length) return selectedText;
          if (from === 0 && to === linkRangeText.length) return linkRangeText;
          return '';
        }),
      },
      schema: { marks: { link: {} } },
    },
  };

  return { editor, chain };
}

describe('LinkInput', () => {
  let clickOutsideCallback: () => void;

  beforeEach(() => {
    useClickOutside.mockImplementation((callback: () => void) => {
      clickOutsideCallback = callback;
      return { current: document.createElement('div') };
    });
  });

  describe('렌더링', () => {
    it('editor.getAttributes("link").href로 URL 초기값을 설정한다', () => {
      const { editor } = createMockEditor({ href: 'https://example.com' });
      render(<LinkInput editor={editor as never} onClose={jest.fn()} />);
      expect(screen.getByLabelText('페이지 또는 URL')).toHaveValue('https://example.com');
    });

    it('선택된 텍스트가 있으면 title 초기값으로 설정한다', () => {
      const { editor } = createMockEditor({ selectedText: '선택된 텍스트', empty: false });
      render(<LinkInput editor={editor as never} onClose={jest.fn()} />);
      expect(screen.getByLabelText('링크 제목')).toHaveValue('선택된 텍스트');
    });

    it('선택 없음·isEditing=true이면 링크 마크 범위 텍스트를 title로 설정한다', () => {
      const { editor } = createMockEditor({ isEditing: true, linkRangeText: '기존 링크 텍스트' });
      render(<LinkInput editor={editor as never} onClose={jest.fn()} />);
      expect(screen.getByLabelText('링크 제목')).toHaveValue('기존 링크 텍스트');
    });

    it('isEditing=true이면 "링크 제거" 버튼이 표시된다', () => {
      const { editor } = createMockEditor({ isEditing: true });
      render(<LinkInput editor={editor as never} onClose={jest.fn()} />);
      expect(screen.getByRole('button', { name: /링크 제거/ })).toBeInTheDocument();
    });

    it('isEditing=false이면 "링크 제거" 버튼이 표시되지 않는다', () => {
      const { editor } = createMockEditor({ isEditing: false });
      render(<LinkInput editor={editor as never} onClose={jest.fn()} />);
      expect(screen.queryByRole('button', { name: /링크 제거/ })).not.toBeInTheDocument();
    });
  });

  describe('applyLink (Enter 키)', () => {
    it('URL이 비어 있으면 editor 명령을 호출하지 않는다', async () => {
      const user = userEvent.setup();
      const { editor, chain } = createMockEditor();
      render(<LinkInput editor={editor as never} onClose={jest.fn()} />);

      await user.click(screen.getByLabelText('페이지 또는 URL'));
      await user.keyboard('{Enter}');

      expect(chain.run).not.toHaveBeenCalled();
    });

    it('selection 없음·isEditing=false → insertContent로 새 링크를 삽입한다', async () => {
      const user = userEvent.setup();
      const { editor, chain } = createMockEditor({ empty: true, isEditing: false });
      render(<LinkInput editor={editor as never} onClose={jest.fn()} />);

      await user.type(screen.getByLabelText('페이지 또는 URL'), 'https://example.com');
      await user.keyboard('{Enter}');

      expect(chain.extendMarkRange).not.toHaveBeenCalled();
      expect(chain.insertContent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'text',
          marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
        }),
      );
      expect(chain.run).toHaveBeenCalled();
    });

    it('selection 없음·isEditing=true·title 변경 → insertContent로 텍스트와 링크를 함께 변경한다', async () => {
      const user = userEvent.setup();
      const { editor, chain } = createMockEditor({
        isEditing: true,
        empty: true,
        linkRangeText: '기존 링크 텍스트',
      });
      render(<LinkInput editor={editor as never} onClose={jest.fn()} />);

      await user.type(screen.getByLabelText('페이지 또는 URL'), 'https://new.com');
      await user.clear(screen.getByLabelText('링크 제목'));
      await user.type(screen.getByLabelText('링크 제목'), '변경된 제목');
      await user.keyboard('{Enter}');

      expect(chain.extendMarkRange).toHaveBeenCalledWith('link');
      expect(chain.insertContent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'text', text: '변경된 제목' }),
      );
    });

    it('selection 없음·isEditing=true·title 미변경 → setLink로 href만 업데이트한다', async () => {
      const user = userEvent.setup();
      const { editor, chain } = createMockEditor({
        href: 'https://old.com',
        isEditing: true,
        empty: true,
        linkRangeText: '링크 텍스트',
      });
      render(<LinkInput editor={editor as never} onClose={jest.fn()} />);

      // title 필드는 '링크 텍스트'로 초기화 → 변경 없이 URL만 수정
      await user.clear(screen.getByLabelText('페이지 또는 URL'));
      await user.type(screen.getByLabelText('페이지 또는 URL'), 'https://new.com');
      await user.keyboard('{Enter}');

      expect(chain.extendMarkRange).toHaveBeenCalledWith('link');
      expect(chain.setLink).toHaveBeenCalledWith({ href: 'https://new.com' });
    });

    it('selection 있음·title == selectedText → setLink로 href만 업데이트한다', async () => {
      const user = userEvent.setup();
      const { editor, chain } = createMockEditor({
        selectedText: '선택된 텍스트',
        empty: false,
        isEditing: false,
      });
      render(<LinkInput editor={editor as never} onClose={jest.fn()} />);

      // title 초기값 = selectedText → 변경 없이 URL 입력
      await user.type(screen.getByLabelText('페이지 또는 URL'), 'https://example.com');
      await user.keyboard('{Enter}');

      expect(chain.extendMarkRange).toHaveBeenCalledWith('link');
      expect(chain.setLink).toHaveBeenCalledWith({ href: 'https://example.com' });
    });

    it('selection 있음·title 변경 → insertContent로 텍스트와 링크를 함께 변경한다', async () => {
      const user = userEvent.setup();
      const { editor, chain } = createMockEditor({
        selectedText: '선택된 텍스트',
        empty: false,
        isEditing: false,
      });
      render(<LinkInput editor={editor as never} onClose={jest.fn()} />);

      await user.type(screen.getByLabelText('페이지 또는 URL'), 'https://example.com');
      await user.clear(screen.getByLabelText('링크 제목'));
      await user.type(screen.getByLabelText('링크 제목'), '새 링크 이름');
      await user.keyboard('{Enter}');

      expect(chain.insertContent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'text', text: '새 링크 이름' }),
      );
    });

    it('applyLink 실행 후 onClose를 호출한다', async () => {
      const onClose = jest.fn();
      const user = userEvent.setup();
      const { editor } = createMockEditor({ empty: true, isEditing: false });
      render(<LinkInput editor={editor as never} onClose={onClose} />);

      await user.type(screen.getByLabelText('페이지 또는 URL'), 'https://example.com');
      await user.keyboard('{Enter}');

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('removeLink', () => {
    it('"링크 제거" 버튼 클릭 시 unsetLink를 호출하고 onClose를 호출한다', async () => {
      const onClose = jest.fn();
      const user = userEvent.setup();
      const { editor, chain } = createMockEditor({ isEditing: true });
      render(<LinkInput editor={editor as never} onClose={onClose} />);

      await user.click(screen.getByRole('button', { name: /링크 제거/ }));

      expect(chain.unsetLink).toHaveBeenCalled();
      expect(chain.run).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('키보드 단축키', () => {
    it('Escape 키를 누르면 onClose를 호출한다', async () => {
      const onClose = jest.fn();
      const user = userEvent.setup();
      const { editor } = createMockEditor();
      render(<LinkInput editor={editor as never} onClose={onClose} />);

      await user.click(screen.getByLabelText('페이지 또는 URL'));
      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('외부 클릭 (useClickOutside)', () => {
    it('URL이 있으면 applyLink를 실행한다', async () => {
      const user = userEvent.setup();
      const { editor, chain } = createMockEditor({ empty: true, isEditing: false });
      render(<LinkInput editor={editor as never} onClose={jest.fn()} />);

      await user.type(screen.getByLabelText('페이지 또는 URL'), 'https://example.com');
      clickOutsideCallback();

      expect(chain.run).toHaveBeenCalled();
    });

    it('URL이 비어 있으면 onClose만 호출한다', () => {
      const onClose = jest.fn();
      const { editor, chain } = createMockEditor();
      render(<LinkInput editor={editor as never} onClose={onClose} />);

      clickOutsideCallback();

      expect(chain.run).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
