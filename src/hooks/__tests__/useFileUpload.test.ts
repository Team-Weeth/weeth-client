import { renderHook, act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { MAX_FILE_SIZE, MAX_IMAGE_FILES, MAX_NON_IMAGE_FILES } from '@/constants/board/file';
import { useFileUpload } from '@/hooks/useFileUpload';
import { fileApi } from '@/lib/apis/file';
import { server } from '@/mocks/server';
import { usePostStore } from '@/stores/usePostStore';
import { toast } from '@/stores/useToastStore';

jest.mock('@/lib/apis/file', () => ({
  fileApi: { getPresignedUrls: jest.fn() },
}));

jest.mock('@/stores/useToastStore', () => ({
  toast: jest.fn(),
}));

const S3_PUT_URL = 'https://s3.example.com/upload';

const mockGetPresignedUrls = fileApi.getPresignedUrls as jest.MockedFunction<
  typeof fileApi.getPresignedUrls
>;
const mockToast = toast as jest.MockedFunction<typeof toast>;

function makeFile(name: string, type = 'image/png', size = 1024): File {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size, configurable: true });
  return file;
}

function mockPresignedUrl(fileName: string) {
  return mockGetPresignedUrls.mockResolvedValue({
    data: {
      status: 200,
      message: 'ok',
      data: [{ fileName, putUrl: S3_PUT_URL, storageKey: `keys/${fileName}` }],
    },
  } as unknown as Awaited<ReturnType<typeof fileApi.getPresignedUrls>>);
}

beforeEach(() => {
  usePostStore.getState().reset();
  URL.createObjectURL = jest.fn(() => 'blob:mock-url');
  URL.revokeObjectURL = jest.fn();
  server.use(http.put(S3_PUT_URL, () => new HttpResponse(null, { status: 200 })));
  // 기본값: presigned URL 요청 실패 (업로드 플로우 테스트에서 개별 override)
  mockGetPresignedUrls.mockRejectedValue(new Error('mock: not configured'));
});

describe('useFileUpload', () => {
  describe('processFiles — 유효성 검사', () => {
    it('허용되지 않는 확장자 → 에러 토스트, 파일이 스토어에 추가되지 않는다', () => {
      const { result } = renderHook(() => useFileUpload());

      act(() => {
        result.current.processFiles([makeFile('virus.exe', 'application/octet-stream')]);
      });

      // exe는 유효성 검사에서 필터링되므로 uploadToS3 호출 자체가 안 됨
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' }));
      expect(usePostStore.getState().files).toHaveLength(0);
    });

    it('10MB 초과 파일 → 에러 토스트, 파일이 스토어에 추가되지 않는다', () => {
      const { result } = renderHook(() => useFileUpload());
      const oversized = makeFile('big.png', 'image/png', MAX_FILE_SIZE + 1);

      act(() => {
        result.current.processFiles([oversized]);
      });

      // 크기 초과도 필터링되므로 uploadToS3 호출 자체가 안 됨
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' }));
      expect(usePostStore.getState().files).toHaveLength(0);
    });

    it('이미지 최대 개수 초과 → 초과 안내 토스트, 최대치까지만 스토어에 추가 후 업로드 오류로 정리된다', async () => {
      const { result } = renderHook(() => useFileUpload());
      const images = Array.from({ length: MAX_IMAGE_FILES + 1 }, (_, i) =>
        makeFile(`img${i}.png`, 'image/png'),
      );

      act(() => {
        result.current.processFiles(images);
      });

      // 개수 초과 토스트가 발생해야 함
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining(`${MAX_IMAGE_FILES}개`),
          variant: 'error',
        }),
      );

      // presigned URL 실패 후 파일이 정리될 때까지 대기 (act 경고 방지)
      await waitFor(() => {
        expect(usePostStore.getState().files).toHaveLength(0);
      });
    });

    it('비이미지 파일 최대 개수 초과 → 초과 안내 토스트, presigned URL 실패 후 정리된다', async () => {
      const { result } = renderHook(() => useFileUpload());
      const pdfs = Array.from({ length: MAX_NON_IMAGE_FILES + 1 }, (_, i) =>
        makeFile(`doc${i}.pdf`, 'application/pdf'),
      );

      act(() => {
        result.current.processFiles(pdfs);
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining(`${MAX_NON_IMAGE_FILES}개`),
          variant: 'error',
        }),
      );

      await waitFor(() => {
        expect(usePostStore.getState().files).toHaveLength(0);
      });
    });

    it('빈 배열을 넘기면 토스트도 발생하지 않고 파일도 추가되지 않는다', () => {
      const { result } = renderHook(() => useFileUpload());

      act(() => {
        result.current.processFiles([]);
      });

      expect(mockToast).not.toHaveBeenCalled();
      expect(usePostStore.getState().files).toHaveLength(0);
    });
  });

  describe('processFiles — 업로드 플로우', () => {
    it('유효한 파일은 즉시 uploaded:false로 추가되고 S3 완료 후 uploaded:true로 갱신된다', async () => {
      mockPresignedUrl('photo.png');
      const { result } = renderHook(() => useFileUpload());

      act(() => {
        result.current.processFiles([makeFile('photo.png')]);
      });

      // 동기적으로 즉시 추가됨
      expect(usePostStore.getState().files).toHaveLength(1);
      expect(usePostStore.getState().files[0].uploaded).toBe(false);

      // 업로드 완료 후 갱신됨
      await waitFor(() => {
        expect(usePostStore.getState().files[0]?.uploaded).toBe(true);
      });
    });

    it('presigned URL 요청 실패 → 에러 토스트, 파일이 스토어에서 제거된다', async () => {
      mockGetPresignedUrls.mockRejectedValue(new Error('Network Error'));
      const { result } = renderHook(() => useFileUpload());

      act(() => {
        result.current.processFiles([makeFile('photo.png')]);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' }));
        expect(usePostStore.getState().files).toHaveLength(0);
      });
    });

    it('S3 PUT 실패 → 에러 토스트, 파일이 스토어에서 제거된다', async () => {
      mockPresignedUrl('photo.png');
      server.use(http.put(S3_PUT_URL, () => new HttpResponse(null, { status: 500 })));
      const { result } = renderHook(() => useFileUpload());

      act(() => {
        result.current.processFiles([makeFile('photo.png')]);
      });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'error' }));
        expect(usePostStore.getState().files).toHaveLength(0);
      });
    });
  });

  describe('handleRemoveFile', () => {
    it('파일이 스토어에서 제거된다', async () => {
      mockPresignedUrl('photo.png');
      const { result } = renderHook(() => useFileUpload());

      act(() => {
        result.current.processFiles([makeFile('photo.png')]);
      });

      const file = usePostStore.getState().files[0];

      act(() => {
        result.current.files.handleRemoveFile(file.id, file.fileUrl);
      });

      expect(usePostStore.getState().files.find((f) => f.id === file.id)).toBeUndefined();

      // in-flight 업로드가 중단된 후 추가 state 변경이 없도록 대기
      await waitFor(() => {
        expect(usePostStore.getState().files).toHaveLength(0);
      });
    });

    it('blob: URL이면 URL.revokeObjectURL이 호출된다', () => {
      const { result } = renderHook(() => useFileUpload());

      act(() => {
        result.current.files.handleRemoveFile('any-id', 'blob:mock-url');
      });

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('blob: URL이 아니면 URL.revokeObjectURL이 호출되지 않는다', () => {
      const { result } = renderHook(() => useFileUpload());

      act(() => {
        result.current.files.handleRemoveFile('any-id', 'https://cdn.example.com/file.png');
      });

      expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    });
  });

  describe('imageFiles / nonImageFiles 분리', () => {
    it('이미지 파일과 비이미지 파일이 분리되어 반환된다', () => {
      usePostStore.setState({
        files: [
          {
            id: 'img1',
            fileName: 'photo.png',
            fileUrl: '/img.png',
            storageKey: '',
            fileSize: 100,
            contentType: 'image/png',
            uploaded: true,
          },
          {
            id: 'doc1',
            fileName: 'report.pdf',
            fileUrl: '/doc.pdf',
            storageKey: '',
            fileSize: 100,
            contentType: 'application/pdf',
            uploaded: true,
          },
        ],
      });

      const { result } = renderHook(() => useFileUpload());

      expect(result.current.files.imageFiles).toHaveLength(1);
      expect(result.current.files.nonImageFiles).toHaveLength(1);
      expect(result.current.files.imageFiles[0].fileName).toBe('photo.png');
      expect(result.current.files.nonImageFiles[0].fileName).toBe('report.pdf');
    });

    it('파일이 없으면 두 목록 모두 비어있다', () => {
      const { result } = renderHook(() => useFileUpload());
      expect(result.current.files.imageFiles).toHaveLength(0);
      expect(result.current.files.nonImageFiles).toHaveLength(0);
    });
  });
});
