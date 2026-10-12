'use client';

import { useEffect, useRef, useState } from 'react';
import FolderPlusIcon from '@/assets/icons/folder_plus.svg';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/cn';

const BELOW_DESKTOP_MEDIA = '(max-width: 1031px)';

interface AttachButtonProps {
  disabled?: boolean;
  onOpenFilePicker: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

function AttachButton({ disabled, onOpenFilePicker, onChange, className }: AttachButtonProps) {
  const attachButtonRef = useRef<HTMLButtonElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const actionTakenRef = useRef(false);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);

  useEffect(() => {
    if (!attachMenuOpen) return;
    const mql = window.matchMedia(BELOW_DESKTOP_MEDIA);
    const handleChange = (e: MediaQueryListEvent) => {
      if (!e.matches) setAttachMenuOpen(false);
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [attachMenuOpen]);

  const handleClick = () => {
    if (window.matchMedia(BELOW_DESKTOP_MEDIA).matches) {
      setAttachMenuOpen(true);
    } else {
      onOpenFilePicker();
    }
  };

  return (
    <>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        disabled={disabled}
        className="hidden"
        onChange={onChange}
        aria-hidden="true"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        disabled={disabled}
        className="hidden"
        onChange={onChange}
        aria-hidden="true"
      />
      <Button
        ref={attachButtonRef}
        type="button"
        variant="secondary"
        size="icon-md"
        disabled={disabled}
        className={cn('shrink-0', className)}
        onClick={handleClick}
        aria-label="파일 첨부"
      >
        <Icon src={FolderPlusIcon} size={20} className="text-icon-normal" />
      </Button>
      <Dialog open={attachMenuOpen} onOpenChange={setAttachMenuOpen}>
        <DialogContent
          className="flex flex-col gap-200"
          showCloseButton={false}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            if (!actionTakenRef.current) {
              attachButtonRef.current?.focus();
            }
            actionTakenRef.current = false;
          }}
        >
          <DialogTitle className="sr-only">파일 첨부</DialogTitle>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                actionTakenRef.current = true;
                cameraInputRef.current?.click();
              }}
            >
              카메라
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                actionTakenRef.current = true;
                galleryInputRef.current?.click();
              }}
            >
              사진 선택
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                actionTakenRef.current = true;
                onOpenFilePicker();
              }}
            >
              파일 선택
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { AttachButton, type AttachButtonProps };
