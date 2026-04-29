'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, Card, Skeleton } from '@/components/ui';
import { CardinalDropdown } from '@/components/admin';
import { useNavigationGuard, useCardinalSelector } from '@/hooks';
import { useFlattenedSessions } from '@/hooks/admin';
import { formatKoreanDate } from '@/lib/formatTime';

import { AttendanceSessionCard } from './AttendanceSessionCard';

function AttendancePageContent() {
  const { cardinals, setSelectedCardinalId, activeCardinal } = useCardinalSelector();
  const [dirtyCardIds, setDirtyCardIds] = useState<Set<number>>(new Set());
  const [pendingCardinalId, setPendingCardinalId] = useState<number | null>(null);
  const [cardinalDialogOpen, setCardinalDialogOpen] = useState(false);

  const isDirty = dirtyCardIds.size > 0;
  const { open, onConfirm, onCancel } = useNavigationGuard({ enabled: isDirty });

  const handleDirtyChange = useCallback((sessionId: number, dirty: boolean) => {
    setDirtyCardIds((prev) => {
      const next = new Set(prev);
      if (dirty) next.add(sessionId);
      else next.delete(sessionId);
      return next;
    });
  }, []);

  const handleCardinalSelect = useCallback(
    (id: number | null) => {
      if (isDirty) {
        setPendingCardinalId(id);
        setCardinalDialogOpen(true);
      } else {
        setSelectedCardinalId(id);
      }
    },
    [isDirty, setSelectedCardinalId],
  );

  const confirmCardinalChange = () => {
    setDirtyCardIds(new Set());
    setCardinalDialogOpen(false);
    if (pendingCardinalId !== null) {
      setSelectedCardinalId(pendingCardinalId);
      setPendingCardinalId(null);
    }
  };

  const cardinalNumber = activeCardinal?.cardinalNumber ?? null;
  const { sessions, isLoading } = useFlattenedSessions(cardinalNumber);

  const searchParams = useSearchParams();
  const targetSessionIdParam = searchParams.get('sessionId');
  const parsedSessionId = targetSessionIdParam ? Number(targetSessionIdParam) : NaN;
  const targetSessionId = Number.isFinite(parsedSessionId) ? parsedSessionId : null;
  const targetCardRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    if (hasScrolledRef.current) return;
    if (targetSessionId === null) return;
    if (!sessions.some((s) => s.id === targetSessionId)) return;
    if (!targetCardRef.current) return;

    targetCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    hasScrolledRef.current = true;
  }, [sessions, targetSessionId]);

  return (
    <div className="flex min-w-0 flex-col gap-400 p-700">
      <CardinalDropdown
        cardinals={cardinals}
        activeCardinal={activeCardinal}
        onSelect={handleCardinalSelect}
        onSelectAll={() => handleCardinalSelect(null)}
      />

      {isLoading ? (
        <Card className="mt-400 gap-400 overflow-x-auto px-600 pt-600 pb-[64px]">
          <div className="min-w-172.5">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="mt-400 h-[72px] w-full rounded-md first:mt-0" />
            ))}
          </div>
        </Card>
      ) : sessions.length > 0 ? (
        <Card className="mt-400 gap-400 overflow-x-auto px-600 pt-600 pb-[64px]">
          <div className="flex min-w-172.5 flex-col gap-400">
            {sessions.map((session) => (
              <AttendanceSessionCard
                key={session.id}
                sessionId={session.id}
                date={formatKoreanDate(new Date(session.start))}
                title={session.title}
                isCurrentWeek={session.isCurrentWeek}
                onDirtyChange={handleDirtyChange}
              />
            ))}
          </div>
        </Card>
      ) : (
        <Card className="mt-400 flex items-center justify-center overflow-x-auto px-600 py-800">
          <div className="min-w-172.5 text-center">
            <span className="typo-body1 text-text-alternative">등록된 정기모임이 없습니다.</span>
          </div>
        </Card>
      )}

      <AlertDialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) onCancel();
        }}
        title="변경 사항이 저장되지 않았어요"
        description={'지금 나가면 수정 중인 내용이 사라집니다.\n계속하시겠어요?'}
      >
        <AlertDialogAction onClick={onConfirm}>나가기</AlertDialogAction>
        <AlertDialogCancel onClick={onCancel}>계속 수정</AlertDialogCancel>
      </AlertDialog>

      <AlertDialog
        open={cardinalDialogOpen}
        onOpenChange={setCardinalDialogOpen}
        title="변경 사항이 저장되지 않았어요"
        description={'기수를 변경하면 수정 중인 내용이 사라집니다.\n계속하시겠어요?'}
      >
        <AlertDialogAction onClick={confirmCardinalChange}>변경하기</AlertDialogAction>
        <AlertDialogCancel>계속 수정</AlertDialogCancel>
      </AlertDialog>
    </div>
  );
}

export { AttendancePageContent };
