'use client';

import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogHeader,
} from '@/components/ui';

interface ProfileIncompleteModalProps {
  open: boolean;
  onClose: () => void;
  onSkip: () => void;
}

export function ProfileIncompleteModal({ open, onClose, onSkip }: ProfileIncompleteModalProps) {
  const router = useRouter();

  // TODO: 프로필 편집 페이지 경로 확정 후 변경
  const handleComplete = () => {
    router.push('/mypage');
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()} status="default">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>프로필 정보가 없습니다</AlertDialogTitle>
          <AlertDialogDescription>
            완성하지 않은 프로필 항목이 있습니다.
            <br />
            지금 프로필을 완성하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleComplete}>지금 완성하기</AlertDialogAction>
          <AlertDialogCancel onClick={onSkip}>다음에 하기</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
