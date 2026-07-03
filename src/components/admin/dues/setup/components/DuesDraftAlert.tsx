'use client';

import { InfoIcon } from '@/assets/icons';
import { Button } from '@/components/ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/Icon';

interface DuesDraftAlertProps {
  open: boolean;
  lastModifiedByName: string | null;
  onContinue: () => void;
  onNew: () => void;
}

function DuesDraftAlert({ open, lastModifiedByName, onContinue, onNew }: DuesDraftAlertProps) {
  // onOpenChange 미전달: ESC/오버레이 클릭으로 닫히지 않고 이어서/새로 중 하나를 반드시 선택하게 한다.
  return (
    <Dialog open={open}>
      <DialogContent
        className="bg-background flex flex-col gap-0 overflow-hidden p-0"
        showCloseButton={false}
        adminMobileFullscreen={false}
      >
        {/* 아이콘 + 텍스트 영역 */}
        <div className="flex flex-col items-center gap-400 px-400 pt-500 pb-400">
          <div className="bg-container-primary-alternative rounded-full p-300">
            <Icon src={InfoIcon} size={24} className="text-brand-primary" alt="" />
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
          <Button variant="primary" size="lg" className="w-full" onClick={onContinue}>
            이어서 작성하기
          </Button>
          <Button variant="secondary" size="lg" className="w-full" onClick={onNew}>
            새로 작성하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { DuesDraftAlert };
