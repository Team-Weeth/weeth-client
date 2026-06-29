import { ArrowRightIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { DuesTransaction } from '@/types/dues';

interface DuesReceiptCardProps {
  transaction: DuesTransaction;
  receiptUrls: string[];
  onOpenReceiptViewer: () => void;
}

function DuesReceiptCard({ transaction, receiptUrls, onOpenReceiptViewer }: DuesReceiptCardProps) {
  const hasReceipt = receiptUrls.length > 0;
  const thumbnailUrl = transaction.receiptThumbnailUrl ?? receiptUrls[0];
  const className = cn(
    'bg-container-neutral flex items-start gap-300 rounded-lg p-450 text-left',
    hasReceipt && 'hover:bg-container-neutral-interaction cursor-pointer transition-colors',
  );
  const content = (
    <>
      <div className="bg-container-neutral-alternative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-sm">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt="" className="size-full object-cover" />
        ) : (
          <span className="typo-caption2 text-text-alternative">영수증</span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-100">
        <p className="typo-sub1 text-text-strong">영수증</p>
        <p
          className={cn('typo-body2', hasReceipt ? 'text-text-alternative' : 'text-text-disabled')}
        >
          {hasReceipt ? '원본 보기' : '첨부된 영수증이 없습니다'}
        </p>
      </div>

      {hasReceipt && (
        <Icon src={ArrowRightIcon} size={12} className="text-icon-normal mt-100 shrink-0" />
      )}
    </>
  );

  if (hasReceipt) {
    return (
      <button
        type="button"
        onClick={onOpenReceiptViewer}
        className={className}
        aria-label="영수증 원본 보기"
      >
        {content}
      </button>
    );
  }

  return <section className={className}>{content}</section>;
}

export { DuesReceiptCard, type DuesReceiptCardProps };
