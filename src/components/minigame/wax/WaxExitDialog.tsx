'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/** 게임을 나가려 할 때 Weeth를 한 번 더 알린다. */
export function WaxExitDialog({
  open,
  weethUrl,
  onStay,
  onLeave,
}: {
  open: boolean;
  weethUrl: string;
  onStay: () => void;
  onLeave: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onStay()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>벌써 수업에서 나가시게요?</AlertDialogTitle>
          <AlertDialogDescription>
            교수님 몰래 왁뿌볼은 Weeth가 만들었어요.
            <br />
            Weeth가 궁금하다면 둘러보고 가세요!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => window.location.assign(weethUrl)}>
            Weeth 알아보기
          </AlertDialogAction>
          <AlertDialogAction variant="secondary" onClick={onLeave}>
            나가기
          </AlertDialogAction>
          <AlertDialogCancel variant="tertiary" size="sm" onClick={onStay}>
            계속 할래요
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
