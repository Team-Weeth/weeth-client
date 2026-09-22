import type { ReactNode } from 'react';
import Image from 'next/image';

import EmptyListIcon from '@/assets/icons/empty_list.svg';
import { DuesContactButton } from '@/components/dues/DuesContactButton';

function DuesPrivateState() {
  return (
    <DuesStatusState
      title="회비가 공개되지 않았어요"
      description="운영진이 회비를 공개하면 확인할 수 있어요."
    />
  );
}

function DuesErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <DuesStatusState
      title="회비 정보를 불러오지 못했어요"
      description="잠시 후 다시 시도해 주세요."
      action={
        <button
          type="button"
          onClick={onRetry}
          className="typo-button2 text-text-alternative hover:text-text-normal cursor-pointer rounded-sm px-0 py-200"
        >
          다시 시도
        </button>
      }
    />
  );
}

function DuesEmptyState() {
  return (
    <DuesStatusState
      title="아직 회비 내역이 기록되지 않았나봐요!"
      description="혹시 문제가 발생했나요?"
      action={<DuesContactButton />}
    />
  );
}

function DuesStatusState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="flex min-h-[520px] w-full flex-col items-center justify-center py-300 text-center">
      <Image src={EmptyListIcon} width={226} height={226} alt="" aria-hidden />
      <div className="flex flex-col items-center gap-[10px]">
        <h2 className="typo-h3 text-text-alternative">{title}</h2>
        <div className="flex items-center justify-center gap-[10px]">
          <span className="typo-body2 text-text-alternative">{description}</span>
          {action ? action : null}
        </div>
      </div>
    </section>
  );
}

export { DuesEmptyState, DuesErrorState, DuesPrivateState, DuesStatusState };
