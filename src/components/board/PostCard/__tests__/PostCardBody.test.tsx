import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { PostCardBody } from '@/components/board/PostCard/PostCardBody';
import { useLineClamp } from '@/hooks/useLineClamp';

jest.mock('isomorphic-dompurify', () => ({
  __esModule: true,
  default: { sanitize: (html: string) => html },
}));

jest.mock('@/hooks/useLineClamp', () => ({
  useLineClamp: jest.fn(),
}));

jest.mock('@/components/ui/FullscreenImageViewer', () => ({
  FullscreenImageViewer: ({ open }: { open: boolean }) =>
    open ? <div data-testid="image-viewer" /> : null,
}));

const mockSetIsExpanded = jest.fn();

function setupLineClamp({ isClamped = false, isExpanded = false } = {}) {
  const ref = React.createRef<HTMLDivElement>();
  (useLineClamp as jest.Mock).mockReturnValue({
    ref,
    isClamped,
    isExpanded,
    setIsExpanded: mockSetIsExpanded,
  });
  return ref;
}

beforeEach(() => {
  setupLineClamp();
  mockSetIsExpanded.mockClear();
});

describe('PostCardBody', () => {
  it('크래시 없이 렌더링된다', () => {
    render(<PostCardBody content="<p>안녕하세요</p>" />);
    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
  });

  describe('이미지 클릭 → 풀스크린 뷰어', () => {
    it('이미지를 클릭하면 뷰어가 열린다', async () => {
      const user = userEvent.setup();
      render(<PostCardBody content='<img src="/photo.png" alt="사진" />' />);

      await user.click(screen.getByRole('img'));

      expect(screen.getByTestId('image-viewer')).toBeInTheDocument();
    });

    it('이미지가 아닌 요소 클릭 시 뷰어가 열리지 않는다', async () => {
      const user = userEvent.setup();
      render(<PostCardBody content='<p>텍스트</p><img src="/photo.png" alt="사진" />' />);

      await user.click(screen.getByText('텍스트'));

      expect(screen.queryByTestId('image-viewer')).not.toBeInTheDocument();
    });

    it('여러 이미지 중 두 번째를 클릭하면 initialIndex가 1로 설정된다', async () => {
      const user = userEvent.setup();
      render(
        <PostCardBody content='<img src="/a.png" alt="첫 번째" /><img src="/b.png" alt="두 번째" />' />,
      );
      const imgs = screen.getAllByRole('img');

      await user.click(imgs[1]);

      // viewer가 열리면 두 번째 이미지가 선택됨을 확인
      expect(screen.getByTestId('image-viewer')).toBeInTheDocument();
    });
  });

  describe('alt 속성 자동 보정', () => {
    it('alt가 없는 img에 빈 alt 속성이 추가된다', async () => {
      const { container } = render(<PostCardBody content='<img src="/photo.png" />' />);
      const img = container.querySelector('img')!;

      await waitFor(() => {
        expect(img).toHaveAttribute('alt', '');
      });
    });

    it('이미 alt가 있는 img는 그대로 유지된다', () => {
      render(<PostCardBody content='<img src="/photo.png" alt="사진 설명" />' />);
      expect(screen.getByRole('img')).toHaveAttribute('alt', '사진 설명');
    });
  });

  describe('expandable 접기/펼치기', () => {
    it('expandable 미지정이면 이어서 보기 버튼이 없다', () => {
      render(<PostCardBody content="<p>내용</p>" />);
      expect(screen.queryByRole('button', { name: '이어서 보기' })).not.toBeInTheDocument();
    });

    it('expandable=true이고 isClamped이면 이어서 보기 버튼이 표시된다', () => {
      setupLineClamp({ isClamped: true });
      render(<PostCardBody content="<p>내용</p>" expandable />);
      expect(screen.getByRole('button', { name: '이어서 보기' })).toBeInTheDocument();
    });

    it('expandable=true이어도 isClamped=false이면 이어서 보기 버튼이 없다', () => {
      render(<PostCardBody content="<p>내용</p>" expandable />);
      expect(screen.queryByRole('button', { name: '이어서 보기' })).not.toBeInTheDocument();
    });

    it('이어서 보기 버튼 클릭 시 setIsExpanded(true)가 호출된다', async () => {
      const user = userEvent.setup();
      setupLineClamp({ isClamped: true });
      render(<PostCardBody content="<p>내용</p>" expandable />);

      await user.click(screen.getByRole('button', { name: '이어서 보기' }));

      expect(mockSetIsExpanded).toHaveBeenCalledWith(true);
    });

    it('isExpanded=true이면 이어서 보기 버튼이 사라진다', () => {
      setupLineClamp({ isClamped: true, isExpanded: true });
      render(<PostCardBody content="<p>내용</p>" expandable />);
      expect(screen.queryByRole('button', { name: '이어서 보기' })).not.toBeInTheDocument();
    });
  });
});
