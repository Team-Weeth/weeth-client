'use client';

import { useState } from 'react';
import { type ReactNode } from 'react';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  Input,
  Textarea,
} from '@/components/ui';
import { TimeIcon } from '@/assets/icons';
import { inquiryApi } from '@/lib/apis/inquiry';
import { toastSuccess, toastError } from '@/stores/useToastStore';
import Image from 'next/image';

interface InquiryDialogProps {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function InquiryDialog({ children, open, onOpenChange }: InquiryDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogOpen = open ?? internalOpen;
  const setDialogOpen = onOpenChange ?? setInternalOpen;

  const handleClose = () => {
    if (isSubmitting) return;
    setDialogOpen(false);
    setEmail('');
    setMessage('');
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) handleClose();
    else setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await inquiryApi.create({ email: email.trim(), message: message.trim() });
      toastSuccess('문의가 전송되었습니다!');
      handleClose();
    } catch {
      toastError('문의 전송에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent
        showCloseButton={false}
        className="flex w-[640px] flex-col bg-[#F3F5F7]"
        onPointerDownOutside={isSubmitting ? (e) => e.preventDefault() : undefined}
        onInteractOutside={isSubmitting ? (e) => e.preventDefault() : undefined}
      >
        <DialogHeader
          icon={<Image src={TimeIcon} width={24} height={24} alt="정보 아이콘" />}
          title={<span className="typo-h2 text-black">가입 문의</span>}
          description={
            <span className="typo-body2 text-[#909599]">
              Weeth 도입이 궁금하신가요?
              <br />
              가입 문의를 남겨주시면 안내해드릴게요.
            </span>
          }
          showClose
          closeClassName="text-[#1E2021]"
          onClose={handleClose}
        />
        <form onSubmit={handleSubmit}>
          <DialogBody className="flex-1">
            <div className="flex flex-col gap-400">
              <div className="flex flex-col gap-200">
                <label htmlFor="inquiry-email" className="typo-caption1 text-[#909599]">
                  알림 받을 메일
                </label>
                <Input
                  id="inquiry-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="bg-white text-black focus:border-[#00c8aa]"
                />
              </div>

              <div className="flex flex-col gap-200">
                <label htmlFor="inquiry-message" className="typo-caption1 text-[#909599]">
                  문의사항
                </label>
                <Textarea
                  id="inquiry-message"
                  value={message}
                  maxLength={1000}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="문의 내용을 작성해주세요."
                  rows={6}
                  className="h-[205px] bg-white text-black focus:border-[#00c8aa]"
                />
              </div>
            </div>
          </DialogBody>

          <div className="h-[1px] w-full bg-[#E6EAED]" />
          <DialogFooter>
            <div className="flex gap-200">
              <button
                type="button"
                className="typo-button1 flex-1 rounded-md bg-[#E6EAED] px-400 py-300 text-black hover:bg-[#b7bcbf]"
                onClick={handleClose}
              >
                취소
              </button>
              <button
                type="submit"
                className="typo-button1 flex-1 rounded-md bg-[#00C8AA] px-400 py-300 text-white hover:bg-[#00877a]"
                disabled={isSubmitting}
              >
                가입 문의
              </button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { InquiryDialog };
