import { cn } from '@/lib/cn';

interface LoadingOverlayProps {
  className?: string;
  spinnerClassName?: string;
  label?: string;
}

function LoadingOverlay({ className, spinnerClassName, label = '로딩 중' }: LoadingOverlayProps) {
  return (
    <div className={cn('absolute inset-0 flex items-center justify-center bg-black/20', className)}>
      <div
        role="status"
        aria-label={label}
        className={cn(
          'size-4 animate-spin rounded-full border-2 border-white border-t-transparent',
          spinnerClassName,
        )}
      />
    </div>
  );
}

export { LoadingOverlay, type LoadingOverlayProps };
