import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategorySelector } from '../CategorySelector';
import type { BoardNavItem } from '@/types/board';

// ──────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────
jest.mock('@/stores', () => ({
  useClubName: jest.fn(() => '위드'),
}));

jest.mock('@/components/board/ChannelList', () => ({
  ChannelList: jest.fn(
    ({
      items,
      onItemSelect,
    }: {
      items: BoardNavItem[];
      activeId: number | null;
      onItemSelect?: (id: number | null) => void;
    }) => (
      <ul>
        {items.map((item) => (
          <li key={item.id ?? item.type}>
            <button type="button" onClick={() => onItemSelect?.(item.id)}>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    ),
  ),
}));

// @/components/ui 배럴은 Radix 포함으로 jsdom 미지원 API를 사용할 수 있으므로
// CategorySelector가 사용하는 컴포넌트만 경량 구현으로 대체
jest.mock('@/components/ui', () => {
  const React = jest.requireActual<typeof import('react')>('react');

  // DropdownMenu 하위 컴포넌트가 open 상태를 공유하기 위한 Context
  const DropdownCtx = React.createContext<{
    open: boolean;
    onOpenChange: (v: boolean) => void;
  }>({ open: false, onOpenChange: () => {} });

  return {
    Breadcrumb: ({ children, className }: React.HTMLAttributes<HTMLElement>) => (
      <nav className={className}>{children}</nav>
    ),
    BreadcrumbList: ({ children }: React.HTMLAttributes<HTMLElement>) => <ol>{children}</ol>,
    BreadcrumbItem: ({ children }: React.HTMLAttributes<HTMLElement>) => <span>{children}</span>,
    DropdownMenu: ({
      children,
      open,
      onOpenChange,
    }: {
      children: React.ReactNode;
      open: boolean;
      onOpenChange: (v: boolean) => void;
    }) => (
      <DropdownCtx.Provider value={{ open, onOpenChange }}>
        <div>{children}</div>
      </DropdownCtx.Provider>
    ),
    DropdownMenuTrigger: ({
      children,
      className,
    }: {
      children: React.ReactNode;
      className?: string;
    }) => {
      const { open, onOpenChange } = React.useContext(DropdownCtx);
      return (
        <button type="button" className={className} onClick={() => onOpenChange(!open)}>
          {children}
        </button>
      );
    },
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => {
      const { open } = React.useContext(DropdownCtx);
      return open ? <div data-testid="dropdown-content">{children}</div> : null;
    },
    Icon: () => null,
  };
});

const { ChannelList } = jest.requireMock('@/components/board/ChannelList') as {
  ChannelList: jest.Mock;
};

// ──────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────
const ITEMS: BoardNavItem[] = [
  { id: null, type: 'ALL', label: '전체' },
  { id: 1, type: 'NOTICE', label: '공지사항' },
  { id: 2, type: 'GENERAL', label: '자유게시판' },
];

describe('CategorySelector', () => {
  beforeEach(() => {
    ChannelList.mockClear();
  });

  // ──────────────────────────────────────────────
  // 렌더링
  // ──────────────────────────────────────────────
  describe('렌더링', () => {
    it('크래시 없이 렌더링된다', () => {
      render(<CategorySelector items={ITEMS} activeId={1} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('activeId에 해당하는 채널명이 트리거에 표시된다', () => {
      render(<CategorySelector items={ITEMS} activeId={2} />);
      expect(screen.getByText('자유게시판')).toBeInTheDocument();
    });

    it('activeId=null이면 채널명이 비어있다 (트리거는 렌더링됨)', () => {
      render(<CategorySelector items={ITEMS} activeId={null} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────
  // 드롭다운 열기/닫기
  // ──────────────────────────────────────────────
  describe('드롭다운 열기/닫기', () => {
    it('초기에는 드롭다운이 닫혀 있다', () => {
      render(<CategorySelector items={ITEMS} activeId={1} />);
      expect(screen.queryByTestId('dropdown-content')).not.toBeInTheDocument();
    });

    it('트리거를 클릭하면 드롭다운이 열린다', async () => {
      const user = userEvent.setup();
      render(<CategorySelector items={ITEMS} activeId={1} />);

      await user.click(screen.getByRole('button'));

      expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    });

    it('채널 선택 후 드롭다운이 닫힌다', async () => {
      const user = userEvent.setup();
      render(<CategorySelector items={ITEMS} activeId={1} onItemSelect={jest.fn()} />);

      await user.click(screen.getByRole('button')); // 트리거 → 열림
      await user.click(screen.getByRole('button', { name: '자유게시판' }));

      expect(screen.queryByTestId('dropdown-content')).not.toBeInTheDocument();
    });
  });

  // ──────────────────────────────────────────────
  // filterAll
  // ──────────────────────────────────────────────
  describe('filterAll', () => {
    it('filterAll=true(기본값)이면 ALL 타입 항목이 ChannelList에 전달되지 않는다', async () => {
      const user = userEvent.setup();
      render(<CategorySelector items={ITEMS} activeId={1} />);

      await user.click(screen.getByRole('button'));

      const { items } = ChannelList.mock.calls[0][0] as { items: BoardNavItem[] };
      expect(items.every((item) => item.type !== 'ALL')).toBe(true);
      expect(items).toHaveLength(2);
    });

    it('filterAll=false이면 ALL 타입 항목도 ChannelList에 전달된다', async () => {
      const user = userEvent.setup();
      render(<CategorySelector items={ITEMS} activeId={1} filterAll={false} />);

      await user.click(screen.getByRole('button'));

      const { items } = ChannelList.mock.calls[0][0] as { items: BoardNavItem[] };
      expect(items.some((item) => item.type === 'ALL')).toBe(true);
      expect(items).toHaveLength(3);
    });
  });

  // ──────────────────────────────────────────────
  // onItemSelect 콜백
  // ──────────────────────────────────────────────
  describe('onItemSelect', () => {
    it('채널 선택 시 onItemSelect가 해당 id로 호출된다', async () => {
      const user = userEvent.setup();
      const onItemSelect = jest.fn();
      render(<CategorySelector items={ITEMS} activeId={1} onItemSelect={onItemSelect} />);

      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('button', { name: '자유게시판' }));

      expect(onItemSelect).toHaveBeenCalledWith(2);
      expect(onItemSelect).toHaveBeenCalledTimes(1);
    });

    it('onItemSelect prop이 없어도 에러가 발생하지 않는다', async () => {
      const user = userEvent.setup();
      render(<CategorySelector items={ITEMS} activeId={1} />);

      await user.click(screen.getByRole('button'));
      await expect(
        user.click(screen.getByRole('button', { name: '자유게시판' })),
      ).resolves.not.toThrow();
    });
  });

  // ──────────────────────────────────────────────
  // ChannelList에 전달되는 props
  // ──────────────────────────────────────────────
  describe('ChannelList props 전달', () => {
    it('activeId가 ChannelList에 그대로 전달된다', async () => {
      const user = userEvent.setup();
      render(<CategorySelector items={ITEMS} activeId={2} />);

      await user.click(screen.getByRole('button'));

      expect(ChannelList.mock.calls[0][0]).toMatchObject({ activeId: 2 });
    });
  });
});
