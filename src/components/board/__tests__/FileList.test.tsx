import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FileList } from '@/components/board/FileList';
import type { DisplayFile } from '@/types/board';

jest.mock('@/assets/icons', () => ({
  DeleteIcon: null,
  DownloadIcon: null,
  FolderIcon: null,
}));
jest.mock('@/components/ui', () => ({
  Icon: () => null,
}));
jest.mock('@/lib/board', () => ({
  stripUuidPrefix: (name: string) => name,
}));

function makeFile(overrides: Partial<DisplayFile> = {}): DisplayFile {
  return {
    id: 1,
    fileName: 'report.pdf',
    fileUrl: '/files/report.pdf',
    uploaded: true,
    ...overrides,
  };
}

describe('FileList', () => {
  it('files가 비어있으면 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<FileList files={[]} />);
    expect(container.firstChild).toBeNull();
  });

  describe('non-editable 모드 (기본값)', () => {
    it('크래시 없이 렌더링된다', () => {
      render(<FileList files={[makeFile()]} />);
      expect(screen.getByText('report.pdf')).toBeInTheDocument();
    });

    it('파일 이름이 렌더링된다', () => {
      render(<FileList files={[makeFile({ fileName: 'summary.pdf' })]} />);
      expect(screen.getByText('summary.pdf')).toBeInTheDocument();
    });

    it('다운로드 링크가 fileUrl을 href로 렌더링한다', () => {
      render(<FileList files={[makeFile({ fileUrl: '/files/doc.pdf' })]} />);
      expect(screen.getByRole('link')).toHaveAttribute('href', '/files/doc.pdf');
    });

    it('uploaded=false이면 링크에 aria-disabled가 설정된다', () => {
      render(<FileList files={[makeFile({ uploaded: false })]} />);
      expect(screen.getByRole('link')).toHaveAttribute('aria-disabled', 'true');
    });

    it('여러 파일이 모두 렌더링된다', () => {
      const files = [
        makeFile({ id: 1, fileName: 'a.pdf' }),
        makeFile({ id: 2, fileName: 'b.pdf' }),
      ];
      render(<FileList files={files} />);
      expect(screen.getByText('a.pdf')).toBeInTheDocument();
      expect(screen.getByText('b.pdf')).toBeInTheDocument();
    });
  });

  describe('editable 모드', () => {
    it('삭제 버튼이 각 파일마다 렌더링된다', () => {
      const files = [
        makeFile({ id: 1, fileName: 'a.pdf' }),
        makeFile({ id: 2, fileName: 'b.pdf' }),
      ];
      render(<FileList files={files} editable onRemove={jest.fn()} />);
      expect(screen.getAllByRole('button', { name: /삭제/ })).toHaveLength(2);
    });

    it('삭제 버튼 클릭 시 onRemove(id, fileUrl)가 호출된다', async () => {
      const user = userEvent.setup();
      const onRemove = jest.fn();
      const file = makeFile({ id: 5, fileName: 'doc.pdf', fileUrl: '/doc.pdf' });

      render(<FileList files={[file]} editable onRemove={onRemove} />);
      await user.click(screen.getByRole('button', { name: 'doc.pdf 삭제' }));

      expect(onRemove).toHaveBeenCalledWith(5, '/doc.pdf');
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('editable 모드에서는 다운로드 링크가 렌더링되지 않는다', () => {
      render(<FileList files={[makeFile()]} editable onRemove={jest.fn()} />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });
});
