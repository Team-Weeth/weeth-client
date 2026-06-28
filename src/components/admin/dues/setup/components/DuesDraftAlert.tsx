'use client';

import Image from 'next/image';

import InfoIcon from '@/assets/icons/info.svg';

interface DuesDraftAlertProps {
  open: boolean;
  lastModifiedByName: string | null;
  onContinue: () => void;
  onNew: () => void;
}

function DuesDraftAlert({ open, lastModifiedByName, onContinue, onNew }: DuesDraftAlertProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div
        className="bg-background border-line flex w-[339px] flex-col overflow-hidden rounded-lg border"
        style={{ boxShadow: 'var(--shadow-dialog)' }}
      >
        {/* 아이콘 + 텍스트 영역 */}
        <div className="flex flex-col items-center gap-400 px-400 pb-400 pt-500">
          <div className="bg-brand-primary/10 rounded-full p-300">
            <Image src={InfoIcon} alt="" width={24} height={24} />
          </div>
          <div className="flex flex-col gap-200 text-center">
            <p className="typo-sub1 text-text-strong">이어서 작성할까요?</p>
            <p className="typo-body2 text-text-alternative">
              작성 중인 내용이 있어요.
              {lastModifiedByName != null && (
                <>
                  <br />
                  {`(이전 작성자 : ${lastModifiedByName})`}
                </>
              )}
            </p>
          </div>
        </div>

        {/* 구분선 + 버튼 영역 */}
        <div className="border-line flex flex-col gap-200 border-t p-400">
          <button
            type="button"
            onClick={onContinue}
            className="bg-button-primary text-text-inverse typo-button1 w-full rounded-md py-300"
          >
            이어서 작성하기
          </button>
          <button
            type="button"
            onClick={onNew}
            className="bg-button-neutral text-text-strong typo-button1 w-full rounded-md py-300"
          >
            새로 작성하기
          </button>
        </div>
      </div>
    </div>
  );
}

export { DuesDraftAlert };
