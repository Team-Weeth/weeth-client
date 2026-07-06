import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ImageCard } from '@/components/board/ImageList/ImageCard';
import type { DisplayFile } from '@/types/board';

jest.mock('@/assets/icons', () => ({ CloseCircleIcon: null }));
jest.mock('@/components/ui', () => ({
  Icon: () => null,
}));

function makeFile(overrides: Partial<DisplayFile> = {}): DisplayFile {
  return {
    id: 'file-1',
    fileName: 'photo.png',
    fileUrl: '/images/photo.png',
    uploaded: true,
    ...overrides,
  };
}

describe('ImageCard', () => {
  it('크래시 없이 렌더링된다', () => {
    render(<ImageCard item={makeFile()} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('fileUrl을 src로, fileName을 alt로 렌더링한다', () => {
    render(<ImageCard item={makeFile({ fileUrl: '/img.png', fileName: 'img.png' })} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/img.png');
    expect(img).toHaveAttribute('alt', 'img.png');
  });

  describe('업로드 상태', () => {
    it('uploaded=false이면 이미지에 opacity-50 클래스가 적용된다', () => {
      render(<ImageCard item={makeFile({ uploaded: false })} />);
      expect(screen.getByRole('img').className).toContain('opacity-50');
    });

    it('uploaded=false이면 로딩 스피너가 표시된다', () => {
      const { container } = render(<ImageCard item={makeFile({ uploaded: false })} />);
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('uploaded=true이면 로딩 스피너가 없다', () => {
      const { container } = render(<ImageCard item={makeFile({ uploaded: true })} />);
      expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
    });

    it('uploaded 미지정이면 로딩 스피너가 없다', () => {
      const { container } = render(
        <ImageCard item={{ id: 'x', fileName: 'f.png', fileUrl: '/f.png' }} />,
      );
      expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
    });
  });

  describe('삭제 버튼', () => {
    it('removable=true이고 onRemove가 있으면 삭제 버튼이 렌더링된다', () => {
      render(<ImageCard item={makeFile()} removable onRemove={jest.fn()} />);
      expect(screen.getByRole('button', { name: /삭제/ })).toBeInTheDocument();
    });

    it('removable=false이면 삭제 버튼이 없다', () => {
      render(<ImageCard item={makeFile()} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('삭제 버튼 클릭 시 onRemove(id, fileUrl)가 호출된다', async () => {
      const user = userEvent.setup();
      const onRemove = jest.fn();
      const file = makeFile({ id: 'abc', fileUrl: '/img.png', fileName: 'img.png' });

      render(<ImageCard item={file} removable onRemove={onRemove} />);
      await user.click(screen.getByRole('button', { name: 'img.png 삭제' }));

      expect(onRemove).toHaveBeenCalledWith('abc', '/img.png');
      expect(onRemove).toHaveBeenCalledTimes(1);
    });
  });
});
