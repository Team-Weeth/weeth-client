'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageInsertModeDialogProps {
  imageCount: number;
  open: boolean;
  onIndividual: () => void;
  onGroup: () => void;
  onCancel: () => void;
}

function ImageInsertModeDialog({
  imageCount,
  open,
  onIndividual,
  onGroup,
  onCancel,
}: ImageInsertModeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <DialogContent showCloseButton={false} className="w-[340px]">
        <div className="flex flex-col gap-500">
          <p className="typo-sub3 text-text-strong text-center">
            이미지 {imageCount}장을 어떻게 첨부할까요?
          </p>
          <div className="flex gap-300">
            <InsertOptionCard label="개별로" onClick={onIndividual}>
              {/* 세로로 쌓인 이미지 */}
              <div className="flex w-full flex-col gap-100">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-container-neutral-alternative h-200 w-full rounded-sm"
                  />
                ))}
              </div>
            </InsertOptionCard>
            <InsertOptionCard label="한 줄로" onClick={onGroup}>
              {/* 가로로 나란한 이미지 */}
              <div className="flex w-full gap-100">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-container-neutral-alternative h-700 flex-1 rounded-sm"
                  />
                ))}
              </div>
            </InsertOptionCard>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface InsertOptionCardProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}

function InsertOptionCard({ label, onClick, children }: InsertOptionCardProps) {
  return (
    <button
      type="button"
      className="hover:bg-container-neutral-interaction flex flex-1 cursor-pointer flex-col items-center gap-300 rounded-md border p-400 transition-colors"
      onClick={onClick}
    >
      {children}
      <span className="typo-button2 text-text-strong">{label}</span>
    </button>
  );
}

export { ImageInsertModeDialog };
