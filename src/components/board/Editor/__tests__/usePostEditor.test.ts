import { renderHook, act } from '@testing-library/react';
import { useEditor } from '@tiptap/react';
import { usePostEditor } from '../usePostEditor';

jest.mock('@tiptap/react', () => ({ useEditor: jest.fn() }));
jest.mock('@/stores/usePostStore');
// editorExtensions 의존성 차단 (lowlight 등 heavy import 방지)
jest.mock('../extensions', () => ({ editorExtensions: [] }));

const useEditorMock = useEditor as jest.Mock;

// usePostStore는 selector 패턴: usePostStore(state => state.setContent)
const { usePostStore } = jest.requireMock('@/stores/usePostStore') as {
  usePostStore: jest.Mock;
};
const mockSetContent = jest.fn();

// useEditor 호출 시 넘어온 config를 전역 변수로 캡처
type EditorPropsHandler = (
  view: Record<string, unknown>,
  event: Record<string, unknown>,
) => boolean;
type EditorEventCallback = (args: Record<string, unknown>) => void;

interface CapturedEditorConfig {
  editorProps: {
    handlePaste: EditorPropsHandler;
    handleDrop: EditorPropsHandler;
    handleKeyDown: EditorPropsHandler;
  };
  onUpdate: EditorEventCallback;
  onSelectionUpdate: EditorEventCallback;
}

let capturedConfig = {} as CapturedEditorConfig;

// handleKeyDown 호출용 최소 view mock
// - 슬래시 메뉴 차단 테스트: return true 이전에 view에 접근하지 않으므로 $from만 있으면 됨
// - Enter/non-backtick/non-backspace 키: $from을 얻기만 하고 메서드 호출 없음
const minimalView = {
  state: { selection: { $from: {} } },
};

// 슬래시 메뉴를 열기 위해 onUpdate를 직접 호출하는 헬퍼
function openSlashMenu() {
  act(() => {
    capturedConfig.onUpdate({
      editor: {
        getHTML: () => '<p>/</p>',
        state: { selection: { $from: { nodeBefore: { textContent: '/' } } } },
      },
    });
  });
}

describe('usePostEditor', () => {
  beforeEach(() => {
    usePostStore.mockImplementation((selector: (s: unknown) => unknown) =>
      selector({ setContent: mockSetContent }),
    );
    useEditorMock.mockImplementation((config: unknown) => {
      capturedConfig = config as CapturedEditorConfig;
      return null; // editor 인스턴스는 Layer A 테스트에서 불필요
    });
  });

  // ──────────────────────────────────────────────
  // processFilesRef — stale closure 방지
  // ──────────────────────────────────────────────
  describe('processFilesRef stale closure 방지', () => {
    it('processFiles가 변경되면 최신 함수를 참조한다', () => {
      const fn1 = jest.fn();
      const fn2 = jest.fn();
      const file = new File([''], 'test.png', { type: 'image/png' });

      const { rerender } = renderHook(
        ({ processFiles }: { processFiles: (f: File[]) => void }) =>
          usePostEditor({ processFiles }),
        { initialProps: { processFiles: fn1 } },
      );

      rerender({ processFiles: fn2 });

      // rerender 후 paste 발생 → fn2가 호출되어야 함 (fn1 stale 아님)
      capturedConfig.editorProps.handlePaste({}, { clipboardData: { files: [file] } });

      expect(fn2).toHaveBeenCalledWith([file]);
      expect(fn1).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────
  // handlePaste
  // ──────────────────────────────────────────────
  describe('handlePaste', () => {
    it('파일이 있으면 processFiles를 호출하고 true를 반환한다', () => {
      const processFiles = jest.fn();
      renderHook(() => usePostEditor({ processFiles }));

      const file = new File([''], 'image.png', { type: 'image/png' });
      const result = capturedConfig.editorProps.handlePaste(
        {},
        { clipboardData: { files: [file] } },
      );

      expect(processFiles).toHaveBeenCalledWith([file]);
      expect(result).toBe(true);
    });

    it('파일이 없으면 false를 반환한다', () => {
      renderHook(() => usePostEditor());

      const result = capturedConfig.editorProps.handlePaste(
        {},
        { clipboardData: { files: [] } },
      );

      expect(result).toBe(false);
    });

    it('clipboardData가 없으면 false를 반환한다', () => {
      renderHook(() => usePostEditor());

      const result = capturedConfig.editorProps.handlePaste({}, {});

      expect(result).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // handleDrop
  // ──────────────────────────────────────────────
  describe('handleDrop', () => {
    it('파일이 있으면 preventDefault 호출 후 processFiles를 실행하고 true를 반환한다', () => {
      const processFiles = jest.fn();
      renderHook(() => usePostEditor({ processFiles }));

      const file = new File([''], 'doc.pdf');
      const event = { preventDefault: jest.fn(), dataTransfer: { files: [file] } };
      const result = capturedConfig.editorProps.handleDrop({}, event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(processFiles).toHaveBeenCalledWith([file]);
      expect(result).toBe(true);
    });

    it('파일이 없으면 false를 반환한다', () => {
      renderHook(() => usePostEditor());

      const result = capturedConfig.editorProps.handleDrop(
        {},
        { dataTransfer: { files: [] } },
      );

      expect(result).toBe(false);
    });

    it('dataTransfer가 없으면 false를 반환한다', () => {
      renderHook(() => usePostEditor());

      const result = capturedConfig.editorProps.handleDrop({}, {});

      expect(result).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // handleKeyDown — 슬래시 메뉴 키보드 차단
  // ──────────────────────────────────────────────
  describe('handleKeyDown — 슬래시 메뉴 차단', () => {
    it.each(['Enter', 'ArrowUp', 'ArrowDown'])(
      '슬래시 메뉴가 열린 상태에서 %s 키를 차단한다 (preventDefault + return true)',
      (key) => {
        renderHook(() => usePostEditor());
        openSlashMenu();

        const event = { key, preventDefault: jest.fn() };
        // 슬래시 메뉴 차단 분기에서 return true → view에 접근하지 않음
        const result = capturedConfig.editorProps.handleKeyDown({}, event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(result).toBe(true);
      },
    );

    it('슬래시 메뉴가 닫힌 상태에서 Enter는 차단하지 않는다', () => {
      renderHook(() => usePostEditor());
      // slash menu closed by default

      const event = { key: 'Enter', preventDefault: jest.fn() };
      const result = capturedConfig.editorProps.handleKeyDown(minimalView, event);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // onUpdate — 슬래시 감지 + setContent 동기화
  // ──────────────────────────────────────────────
  describe('onUpdate', () => {
    it('/ 입력 시 showSlashMenu가 true가 된다', () => {
      const { result } = renderHook(() => usePostEditor());

      act(() => {
        capturedConfig.onUpdate({
          editor: {
            getHTML: () => '<p>/</p>',
            state: { selection: { $from: { nodeBefore: { textContent: '/' } } } },
          },
        });
      });

      expect(result.current.showSlashMenu).toBe(true);
    });

    it('일반 텍스트 입력 시 showSlashMenu가 false이다', () => {
      const { result } = renderHook(() => usePostEditor());

      act(() => {
        capturedConfig.onUpdate({
          editor: {
            getHTML: () => '<p>hello</p>',
            state: { selection: { $from: { nodeBefore: { textContent: 'hello' } } } },
          },
        });
      });

      expect(result.current.showSlashMenu).toBe(false);
    });

    it('에디터 HTML을 setContent로 동기화한다', () => {
      renderHook(() => usePostEditor());

      const html = '<p>게시글 내용</p>';
      act(() => {
        capturedConfig.onUpdate({
          editor: {
            getHTML: () => html,
            state: { selection: { $from: { nodeBefore: null } } },
          },
        });
      });

      expect(mockSetContent).toHaveBeenCalledWith(html);
    });
  });

  // ──────────────────────────────────────────────
  // onSelectionUpdate — 커서 이동 시 슬래시 메뉴 닫기
  // ──────────────────────────────────────────────
  describe('onSelectionUpdate', () => {
    it('슬래시 메뉴가 열린 상태에서 커서가 / 밖으로 이동하면 메뉴가 닫힌다', () => {
      const { result } = renderHook(() => usePostEditor());

      openSlashMenu();
      expect(result.current.showSlashMenu).toBe(true);

      act(() => {
        capturedConfig.onSelectionUpdate({
          editor: {
            state: { selection: { $from: { nodeBefore: { textContent: 'hello' } } } },
          },
        });
      });

      expect(result.current.showSlashMenu).toBe(false);
    });

    it('슬래시 메뉴가 이미 닫혀 있으면 onSelectionUpdate가 아무것도 하지 않는다', () => {
      const { result } = renderHook(() => usePostEditor());
      // menu closed by default

      act(() => {
        capturedConfig.onSelectionUpdate({
          editor: {
            state: { selection: { $from: { nodeBefore: { textContent: 'hello' } } } },
          },
        });
      });

      expect(result.current.showSlashMenu).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // closeSlashMenu
  // ──────────────────────────────────────────────
  describe('closeSlashMenu', () => {
    it('closeSlashMenu 호출 시 showSlashMenu가 false가 된다', () => {
      const { result } = renderHook(() => usePostEditor());

      openSlashMenu();
      expect(result.current.showSlashMenu).toBe(true);

      act(() => {
        result.current.closeSlashMenu();
      });

      expect(result.current.showSlashMenu).toBe(false);
    });
  });
});
