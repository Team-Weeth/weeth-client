import { render, screen } from '@testing-library/react';

import { ImageList } from '@/components/board/ImageList';
import type { DisplayFile } from '@/types/board';

jest.mock('@/assets/icons', () => ({ CloseCircleIcon: null }));
jest.mock('@/components/ui', () => ({
  Icon: () => null,
}));

jest.mock('@/hooks', () => ({
  useDragScroll: () => ({
    ref: { current: null },
    onMouseDown: jest.fn(),
    onKeyDown: jest.fn(),
    scrollToEnd: jest.fn(),
  }),
  useScrollOnGrow: jest.fn(),
}));

function makeFile(id: string, name = 'photo.png'): DisplayFile {
  return { id, fileName: name, fileUrl: `/img/${name}`, uploaded: true };
}

describe('ImageList', () => {
  it('files가 비어있으면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<ImageList files={[]} />);
    expect(container.firstChild).toBeNull();
  });

  describe('파일 1개', () => {
    it('이미지가 렌더링된다', () => {
      render(<ImageList files={[makeFile('1')]} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('스크롤 region 컨테이너가 없다', () => {
      render(<ImageList files={[makeFile('1')]} />);
      expect(screen.queryByRole('region')).not.toBeInTheDocument();
    });
  });

  describe('파일 2개 이상', () => {
    const files = [makeFile('1', 'a.png'), makeFile('2', 'b.png'), makeFile('3', 'c.png')];

    it('"첨부된 이미지 목록" aria-label을 가진 region이 렌더링된다', () => {
      render(<ImageList files={files} />);
      expect(screen.getByRole('region', { name: '첨부된 이미지 목록' })).toBeInTheDocument();
    });

    it('파일 수만큼 이미지가 렌더링된다', () => {
      render(<ImageList files={files} />);
      expect(screen.getAllByRole('img')).toHaveLength(3);
    });
  });

  describe('removable 모드', () => {
    it('removable=true이면 각 이미지카드에 삭제 버튼이 렌더링된다', () => {
      const onRemove = jest.fn();
      const files = [makeFile('1', 'a.png'), makeFile('2', 'b.png')];

      render(<ImageList files={files} removable onRemove={onRemove} />);

      expect(screen.getAllByRole('button', { name: /삭제/ })).toHaveLength(2);
    });
  });
});
