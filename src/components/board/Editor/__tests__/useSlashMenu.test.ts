import { renderHook, act } from '@testing-library/react';
import { useSlashMenu } from '../useSlashMenu';
import type { MenuItem } from '@/types/editor';

// DEFAULT_GROUPS를 비워 extraGroups로만 테스트 데이터를 제어한다
jest.mock('@/constants/board/slashMenu', () => ({ STYLE_ITEMS: [] }));
// useClickOutside는 UI 이벤트 의존성이므로 무력화한다
jest.mock('@/hooks/useClickOutside', () => ({
  useClickOutside: () => ({ current: null }),
}));

// --- Mock editor factory ---

type MockEditorHandle = {
  editor: ReturnType<typeof buildMockEditor>;
  dom: HTMLDivElement;
  setNodeBefore: (text: string) => void;
  triggerUpdate: () => void;
};

function buildMockEditor(initialNodeBefore = '') {
  const dom = document.createElement('div');
  const updateListeners: Array<() => void> = [];
  let _nodeBeforeText = initialNodeBefore;

  const chainMock = {
    focus: jest.fn().mockReturnThis(),
    deleteRange: jest.fn().mockReturnThis(),
    run: jest.fn(),
  };

  return {
    get state() {
      return {
        selection: {
          $anchor: {
            nodeBefore: _nodeBeforeText ? { textContent: _nodeBeforeText } : null,
            pos: _nodeBeforeText.length + 1,
          },
        },
      };
    },
    on: jest.fn((event: string, cb: () => void) => {
      if (event === 'update') updateListeners.push(cb);
    }),
    off: jest.fn(),
    view: { dom },
    chain: jest.fn(() => chainMock),
    // 테스트용 헬퍼
    _setNodeBefore: (text: string) => {
      _nodeBeforeText = text;
    },
    _triggerUpdate: () => updateListeners.forEach((cb) => cb()),
    dom,
  };
}

function createEditorHandle(initialNodeBefore = ''): MockEditorHandle {
  const editor = buildMockEditor(initialNodeBefore);
  return {
    editor,
    dom: editor.dom,
    setNodeBefore: editor._setNodeBefore,
    triggerUpdate: editor._triggerUpdate,
  };
}

// --- Test item factory ---

function makeItems(labels: string[]): MenuItem[] {
  return labels.map((label) => ({
    label,
    icon: jest.fn() as unknown as MenuItem['icon'],
    command: jest.fn(),
  }));
}

// --- Tests ---

describe('useSlashMenu', () => {
  describe('쿼리 필터링', () => {
    it('빈 쿼리("/")는 extraGroups의 모든 항목을 반환한다', () => {
      const { editor } = createEditorHandle('/');
      const items = makeItems(['항목A', '항목B', '항목C']);
      const onClose = jest.fn();

      const { result } = renderHook(() =>
        useSlashMenu(editor as never, onClose, [{ title: '테스트', items }]),
      );

      expect(result.current.flatItems).toHaveLength(3);
      expect(result.current.filteredGroups[0].title).toBe('테스트');
    });

    it('쿼리와 일치하는 label만 필터링된다', () => {
      const { editor } = createEditorHandle('/항목A');
      const items = makeItems(['항목A', '항목B', '항목C']);
      const onClose = jest.fn();

      const { result } = renderHook(() =>
        useSlashMenu(editor as never, onClose, [{ title: '테스트', items }]),
      );

      expect(result.current.flatItems).toHaveLength(1);
      expect(result.current.flatItems[0].label).toBe('항목A');
    });

    it('매칭 항목이 없으면 onClose를 호출한다', () => {
      const { editor } = createEditorHandle('/없는항목');
      const items = makeItems(['항목A', '항목B']);
      const onClose = jest.fn();

      renderHook(() => useSlashMenu(editor as never, onClose, [{ title: '테스트', items }]));

      expect(onClose).toHaveBeenCalled();
    });

    it('매칭 항목이 있으면 onClose를 호출하지 않는다', () => {
      const { editor } = createEditorHandle('/항목');
      const items = makeItems(['항목A', '항목B']);
      const onClose = jest.fn();

      renderHook(() => useSlashMenu(editor as never, onClose, [{ title: '테스트', items }]));

      expect(onClose).not.toHaveBeenCalled();
    });

    it('두 그룹이 있을 때 두 번째 그룹의 offset은 첫 번째 그룹 항목 수이다', () => {
      const { editor } = createEditorHandle('/');
      const groupA = makeItems(['A1', 'A2', 'A3']); // 3개
      const groupB = makeItems(['B1', 'B2']); // 2개
      const onClose = jest.fn();

      const { result } = renderHook(() =>
        useSlashMenu(editor as never, onClose, [
          { title: '그룹A', items: groupA },
          { title: '그룹B', items: groupB },
        ]),
      );

      expect(result.current.filteredGroups[0].offset).toBe(0);
      expect(result.current.filteredGroups[1].offset).toBe(3);
    });

    it('대소문자를 구분하지 않고 필터링한다', () => {
      const { editor } = createEditorHandle('/hello');
      const items = makeItems(['Hello World', '다른 항목']);
      const onClose = jest.fn();

      const { result } = renderHook(() =>
        useSlashMenu(editor as never, onClose, [{ title: '테스트', items }]),
      );

      expect(result.current.flatItems).toHaveLength(1);
      expect(result.current.flatItems[0].label).toBe('Hello World');
    });
  });

  describe('키보드 네비게이션', () => {
    it('ArrowDown: selectedIndex가 1 증가한다', () => {
      const { editor, dom } = createEditorHandle('/');
      const items = makeItems(['A', 'B', 'C']);
      const onClose = jest.fn();

      const { result } = renderHook(() =>
        useSlashMenu(editor as never, onClose, [{ title: '테스트', items }]),
      );

      expect(result.current.selectedIndex).toBe(0);

      act(() => {
        dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      });

      expect(result.current.selectedIndex).toBe(1);
    });

    it('ArrowDown: 마지막 항목에서 첫 항목으로 wrap된다', () => {
      const { editor, dom } = createEditorHandle('/');
      const items = makeItems(['A', 'B']); // 2개
      const onClose = jest.fn();

      const { result } = renderHook(() =>
        useSlashMenu(editor as never, onClose, [{ title: '테스트', items }]),
      );

      // 마지막 항목(index 1)으로 이동
      act(() => {
        dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      });
      expect(result.current.selectedIndex).toBe(1);

      // wrap → 첫 항목(index 0)
      act(() => {
        dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      });
      expect(result.current.selectedIndex).toBe(0);
    });

    it('ArrowUp: 첫 항목에서 마지막 항목으로 wrap된다', () => {
      const { editor, dom } = createEditorHandle('/');
      const items = makeItems(['A', 'B', 'C']); // 3개
      const onClose = jest.fn();

      const { result } = renderHook(() =>
        useSlashMenu(editor as never, onClose, [{ title: '테스트', items }]),
      );

      expect(result.current.selectedIndex).toBe(0);

      act(() => {
        dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      });

      expect(result.current.selectedIndex).toBe(2); // 마지막 index = 3 - 1
    });

    it('Escape: onClose를 호출한다', () => {
      const { editor, dom } = createEditorHandle('/');
      const items = makeItems(['A', 'B']);
      const onClose = jest.fn();

      renderHook(() => useSlashMenu(editor as never, onClose, [{ title: '테스트', items }]));

      act(() => {
        dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('Enter: 현재 selectedIndex의 command를 실행하고 onClose를 호출한다', () => {
      const { editor, dom } = createEditorHandle('/');
      const commandA = jest.fn();
      const commandB = jest.fn();
      const items: MenuItem[] = [
        { label: 'A', icon: jest.fn() as unknown as MenuItem['icon'], command: commandA },
        { label: 'B', icon: jest.fn() as unknown as MenuItem['icon'], command: commandB },
      ];
      const onClose = jest.fn();

      renderHook(() => useSlashMenu(editor as never, onClose, [{ title: '테스트', items }]));
      // selectedIndex = 0 → commandA가 실행되어야 함

      act(() => {
        dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });

      expect(commandA).toHaveBeenCalledWith(editor);
      expect(commandB).not.toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('Enter: ArrowDown 이후 이동한 항목의 command를 실행한다', () => {
      const { editor, dom } = createEditorHandle('/');
      const commandA = jest.fn();
      const commandB = jest.fn();
      const items: MenuItem[] = [
        { label: 'A', icon: jest.fn() as unknown as MenuItem['icon'], command: commandA },
        { label: 'B', icon: jest.fn() as unknown as MenuItem['icon'], command: commandB },
      ];
      const onClose = jest.fn();

      renderHook(() => useSlashMenu(editor as never, onClose, [{ title: '테스트', items }]));

      // index 1로 이동 후 Enter
      act(() => {
        dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      });
      act(() => {
        dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      });

      expect(commandB).toHaveBeenCalledWith(editor);
      expect(commandA).not.toHaveBeenCalled();
    });
  });

  describe('쿼리 변경 시 인덱스 리셋', () => {
    it('쿼리가 변경되면 selectedIndex가 0으로 초기화된다', () => {
      const { editor, dom, setNodeBefore, triggerUpdate } = createEditorHandle('/');
      const items = makeItems(['항목A', '항목B', '항목C']);
      const onClose = jest.fn();

      const { result } = renderHook(() =>
        useSlashMenu(editor as never, onClose, [{ title: '테스트', items }]),
      );

      // ArrowDown으로 index 이동
      act(() => {
        dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      });
      expect(result.current.selectedIndex).toBe(1);

      // 쿼리 변경 → index 리셋
      act(() => {
        setNodeBefore('/항목B');
        triggerUpdate();
      });

      expect(result.current.selectedIndex).toBe(0);
    });

    it('쿼리가 동일하면 selectedIndex를 유지한다', () => {
      const { editor, dom, triggerUpdate } = createEditorHandle('/');
      const items = makeItems(['항목A', '항목B', '항목C']);
      const onClose = jest.fn();

      const { result } = renderHook(() =>
        useSlashMenu(editor as never, onClose, [{ title: '테스트', items }]),
      );

      act(() => {
        dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      });
      expect(result.current.selectedIndex).toBe(1);

      // 동일한 nodeBefore로 update 트리거 → 쿼리 불변 → index 유지
      act(() => {
        triggerUpdate();
      });

      expect(result.current.selectedIndex).toBe(1);
    });
  });

  describe('엣지 케이스', () => {
    it('항목이 없을 때 키보드 이벤트를 무시한다 (selectedIndex 불변)', () => {
      // STYLE_ITEMS = [] + extraGroups 없음 → flatItems = []
      // query = '' 이므로 onClose 자동 호출도 없음
      const { editor, dom } = createEditorHandle('/');
      const onClose = jest.fn();

      const { result } = renderHook(() => useSlashMenu(editor as never, onClose));

      expect(result.current.flatItems).toHaveLength(0);

      act(() => {
        dom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      });

      // items.length === 0 early return → selectedIndex 불변
      expect(result.current.selectedIndex).toBe(0);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('nodeBefore가 null이면 빈 쿼리로 처리하고 모든 항목을 반환한다', () => {
      // initialNodeBefore = '' → nodeBefore: null → getSlashQuery → null ?? '' = ''
      const { editor } = createEditorHandle('');
      const items = makeItems(['A', 'B']);
      const onClose = jest.fn();

      const { result } = renderHook(() =>
        useSlashMenu(editor as never, onClose, [{ title: '테스트', items }]),
      );

      // query = '' → 모든 항목 표시, onClose 미호출
      expect(result.current.flatItems).toHaveLength(2);
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
