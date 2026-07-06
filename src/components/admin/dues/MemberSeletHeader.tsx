import { BackIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';

function MemberSelectHeader({
  selectedIds,
  setSelectedIds,
  markUnpaid,
  selectedTargetIds,
}: {
  selectedIds: number[];
  setSelectedIds: () => void;
  refund: () => void;
  markUnpaid: () => void;
  selectedTargetIds: () => void;
}) {
  return (
    <div className="bg-container-primary sticky top-0 z-10 -mt-15 flex h-15 items-center justify-between px-400">
      <div className="flex items-center gap-300">
        <button
          type="button"
          onClick={() => setSelectedIds(new Set())}
          aria-label="선택 해제"
          className="text-text-inverse hover:bg-container-primary-interaction flex cursor-pointer self-center rounded-sm p-200 transition-colors"
        >
          <Icon src={BackIcon} alt="" size={18} />
        </button>
        <span className="typo-sub3 text-text-inverse">{selectedIds.size}명 선택됨</span>
      </div>
      <div className="flex gap-200">
        <button
          type="button"
          onClick={() => markUnpaid({ targetIds: selectedTargetIds() })}
          className="bg-button-neutral typo-button1 text-text-strong hover:bg-button-neutral-interaction cursor-pointer rounded-md px-400 py-200 transition-colors"
        >
          납부 정정
        </button>
        <button
          type="button"
          onClick={() => refund({ targetIds: selectedTargetIds(), memo: '' })}
          className="bg-button-neutral typo-button1 text-text-strong hover:bg-button-neutral-interaction cursor-pointer rounded-md px-400 py-200 transition-colors"
        >
          환불 처리
        </button>
        <button
          type="button"
          onClick={() =>
            markPaid({ targetIds: selectedTargetIds(), paidAt: nowLocalDateTime(), memo: '' })
          }
          className="bg-button-neutral typo-button1 text-text-strong hover:bg-button-neutral-interaction cursor-pointer rounded-md px-400 py-200 transition-colors"
        >
          납부 완료
        </button>
      </div>
    </div>
  );
}

export { MemberSelectHeader };
