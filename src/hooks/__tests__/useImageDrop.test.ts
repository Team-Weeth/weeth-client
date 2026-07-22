import { renderHook, act } from '@testing-library/react';

import { useImageDrop } from '@/hooks/useImageDrop';

function makeDragEvent(files: File[]): React.DragEvent {
  return {
    preventDefault: jest.fn(),
    dataTransfer: { files } as unknown as DataTransfer,
  } as unknown as React.DragEvent;
}

describe('useImageDrop', () => {
  it('초기 isDragging은 false이다', () => {
    const { result } = renderHook(() => useImageDrop({ onDrop: jest.fn() }));
    expect(result.current.isDragging).toBe(false);
  });

  it('dragHandlers 객체가 반환된다', () => {
    const { result } = renderHook(() => useImageDrop({ onDrop: jest.fn() }));
    expect(typeof result.current.dragHandlers.onDragOver).toBe('function');
    expect(typeof result.current.dragHandlers.onDragLeave).toBe('function');
    expect(typeof result.current.dragHandlers.onDrop).toBe('function');
  });

  describe('dragHandlers', () => {
    it('onDragOver → isDragging이 true가 된다', () => {
      const { result } = renderHook(() => useImageDrop({ onDrop: jest.fn() }));

      act(() => {
        result.current.dragHandlers.onDragOver({
          preventDefault: jest.fn(),
        } as unknown as React.DragEvent);
      });

      expect(result.current.isDragging).toBe(true);
    });

    it('onDragLeave → isDragging이 false가 된다', () => {
      const { result } = renderHook(() => useImageDrop({ onDrop: jest.fn() }));

      act(() => {
        result.current.dragHandlers.onDragOver({
          preventDefault: jest.fn(),
        } as unknown as React.DragEvent);
      });
      act(() => {
        result.current.dragHandlers.onDragLeave({
          preventDefault: jest.fn(),
        } as unknown as React.DragEvent);
      });

      expect(result.current.isDragging).toBe(false);
    });

    it('onDrop — 이미지 파일이면 onDrop 콜백이 파일과 함께 호출된다', () => {
      const onDrop = jest.fn();
      const { result } = renderHook(() => useImageDrop({ onDrop }));
      const imageFile = new File([''], 'photo.png', { type: 'image/png' });

      act(() => {
        result.current.dragHandlers.onDrop(makeDragEvent([imageFile]));
      });

      expect(onDrop).toHaveBeenCalledWith(imageFile);
      expect(onDrop).toHaveBeenCalledTimes(1);
    });

    it('onDrop — 이미지가 아닌 파일이면 onDrop 콜백이 호출되지 않는다', () => {
      const onDrop = jest.fn();
      const { result } = renderHook(() => useImageDrop({ onDrop }));
      const pdfFile = new File([''], 'doc.pdf', { type: 'application/pdf' });

      act(() => {
        result.current.dragHandlers.onDrop(makeDragEvent([pdfFile]));
      });

      expect(onDrop).not.toHaveBeenCalled();
    });

    it('onDrop 후 isDragging이 false로 리셋된다', () => {
      const { result } = renderHook(() => useImageDrop({ onDrop: jest.fn() }));
      const imageFile = new File([''], 'photo.png', { type: 'image/png' });

      act(() => {
        result.current.dragHandlers.onDragOver({
          preventDefault: jest.fn(),
        } as unknown as React.DragEvent);
      });
      act(() => {
        result.current.dragHandlers.onDrop(makeDragEvent([imageFile]));
      });

      expect(result.current.isDragging).toBe(false);
    });

    it('onDrop — 파일이 없으면 onDrop 콜백이 호출되지 않는다', () => {
      const onDrop = jest.fn();
      const { result } = renderHook(() => useImageDrop({ onDrop }));

      act(() => {
        result.current.dragHandlers.onDrop(makeDragEvent([]));
      });

      expect(onDrop).not.toHaveBeenCalled();
    });
  });
});
