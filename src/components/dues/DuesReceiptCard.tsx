import ArrowRightIcon from '@/assets/icons/arrow_right.svg';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { DuesReceiptFile, DuesTransaction } from '@/types/dues';
import { isPdfReceipt } from '@/utils/dues/duesTransaction';

interface DuesReceiptCardProps {
  transaction: DuesTransaction;
  receiptFiles: DuesReceiptFile[];
  onOpenReceiptViewer: () => void;
}

function DuesReceiptCard({ transaction, receiptFiles, onOpenReceiptViewer }: DuesReceiptCardProps) {
  const hasReceipt = receiptFiles.length > 0;
  const firstReceipt = receiptFiles[0];
  const thumbnailUrl = transaction.receiptThumbnailUrl ?? firstReceipt?.fileUrl;
  const isPdf = firstReceipt ? isPdfReceipt(firstReceipt) : false;
  const className = cn(
    'bg-container-neutral flex items-start gap-300 rounded-lg p-450 text-left',
    hasReceipt && 'hover:bg-container-neutral-interaction cursor-pointer transition-colors',
  );
  const content = (
    <>
      <div className="bg-container-neutral-alternative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-sm">
        {isPdf ? (
          <span className="typo-caption1 text-text-alternative">PDF</span>
        ) : thumbnailUrl ? (
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
    if (isPdf) {
      return (
        <a
          href={firstReceipt.fileUrl}
          target="_blank"
          rel="noreferrer"
          className={className}
          aria-label="PDF 영수증 원본 보기"
        >
          {content}
        </a>
      );
    }

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
