'use client';

import { useState } from 'react';
import { type ReactNode } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  Input,
  Textarea,
} from '@/components/ui';
import { Icon } from '@/components/ui/Icon';
import { InfoCircleIcon } from '@/assets/icons';
import { inquiryApi } from '@/lib/apis/inquiry';
import { toastSuccess, toastError } from '@/stores/useToastStore';

interface InquiryDialogProps {
  children: ReactNode;
}

function InquiryDialog({ children }: InquiryDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    setOpen(false);
    setEmail('');
    setMessage('');
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) handleClose();
    else setOpen(true);
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="bg-background flex w-[640px] flex-col"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader
          icon={
            <Icon src={InfoCircleIcon} size={24} className="text-brand-primary" alt="정보 아이콘" />
          }
          title="가입문의"
          description={`Weeth 도입이 궁금하신가요?\n가입 문의를 남겨주시면 안내해드릴게요.`}
          showClose
          onClose={handleClose}
        />

        <form onSubmit={handleSubmit}>
          <DialogBody className="flex-1">
            <div className="flex flex-col gap-400">
              <div className="flex flex-col gap-200">
                <label htmlFor="inquiry-email" className="typo-caption1 text-text-alternative">
                  연락 가능한 이메일
                </label>
                <Input
                  id="inquiry-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                />
              </div>

              <div className="flex flex-col gap-200">
                <label htmlFor="inquiry-message" className="typo-caption1 text-text-alternative">
                  문의사항
                </label>
                <Textarea
                  id="inquiry-message"
                  required
                  value={message}
                  maxLength={1000}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="문의 내용을 작성해주세요."
                  rows={6}
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter showDivider>
            <div className="flex gap-200">
              <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
                취소
              </Button>
              <Button type="submit" variant="primary" className="flex-1" disabled={isSubmitting}>
                전송
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { InquiryDialog };
