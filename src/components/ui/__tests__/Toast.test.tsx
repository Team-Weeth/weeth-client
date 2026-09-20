import { render, screen } from '@testing-library/react';

import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast';
import type { ToastVariant } from '@/stores/useToastStore';

jest.mock('@/components/ui/Icon', () => ({
  Icon: function MockIcon({
    className,
  }: {
    src: { src: string };
    size?: number;
    className?: string;
  }) {
    return <span data-testid="toast-icon" className={className} />;
  },
}));

function renderToast(variant?: ToastVariant, message = '저장되었습니다') {
  return render(
    <ToastProvider>
      <Toast variant={variant}>{message}</Toast>
      <ToastViewport />
    </ToastProvider>,
  );
}

describe('Toast', () => {
  it('기본 variant로 렌더링된다', () => {
    renderToast();
    expect(screen.getByText('저장되었습니다')).toBeInTheDocument();
  });

  it('children이 메시지로 표시된다', () => {
    renderToast(undefined, '파일이 삭제되었습니다');
    expect(screen.getByText('파일이 삭제되었습니다')).toBeInTheDocument();
  });

  it.each(['success', 'warning', 'error'] as const)('variant="%s"로 렌더링된다', (variant) => {
    renderToast(variant);
    expect(screen.getByText('저장되었습니다')).toBeInTheDocument();
  });

  describe('아이콘 색상 매핑', () => {
    it.each([
      { variant: 'success' as const, expectedClass: 'text-brand-primary' },
      { variant: 'warning' as const, expectedClass: 'text-state-caution' },
      { variant: 'error' as const, expectedClass: 'text-state-error' },
    ])(
      'variant="$variant"는 $expectedClass 색상 아이콘을 렌더링한다',
      ({ variant, expectedClass }) => {
        renderToast(variant);
        expect(screen.getByTestId('toast-icon')).toHaveClass(expectedClass);
      },
    );
  });
});
