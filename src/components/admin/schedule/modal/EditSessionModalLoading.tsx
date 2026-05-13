'use client';

import { AdminCloseIcon } from '@/assets/icons/admin';
import { ModalIconButton } from '@/components/admin';

interface EditSessionModalLoadingProps {
  onClose: () => void;
}

function EditSessionModalLoading({ onClose }: EditSessionModalLoadingProps) {
  return (
    <>
      <div className="flex items-start justify-between px-400 pt-400 tablet:px-700 tablet:pt-700">
        <div className="flex h-8 items-end">
          <span className="typo-button2 text-text-strong border-brand-primary border-b-2 px-100 pb-200">
            세션
          </span>
        </div>
        <ModalIconButton icon={AdminCloseIcon} label="닫기" onClick={onClose} />
      </div>
      <div className="flex min-h-150 flex-col px-400 pb-400 tablet:px-700 tablet:pb-700">
        <h2 className="typo-h3 text-text-normal py-400">세션 수정</h2>
        <div className="flex flex-1 items-center justify-center">
          <p className="typo-body2 text-text-alternative">불러오는 중...</p>
        </div>
      </div>
    </>
  );
}

export { EditSessionModalLoading, type EditSessionModalLoadingProps };
