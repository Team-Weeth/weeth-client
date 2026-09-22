'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';

interface CardinalMissingModalProps {
  open: boolean;
  onClose: () => void;
  description?: string;
}

export function CardinalMissingModal({
  open,
  onClose,
  description = '게시글 작성을 위해 기수 정보가 필요합니다.',
}: CardinalMissingModalProps) {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();

  // TODO: 기수 입력 페이지 경로 확정 후 변경
  const handleComplete = () => {
    router.push(`/${clubId}/mypage`);
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()} status="default">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>기수를 입력해주셔야 합니다</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
            <br />
            기수 입력 페이지로 이동하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleComplete}>지금 완성하기</AlertDialogAction>
          <AlertDialogCancel onClick={onClose}>다음에 하기</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
