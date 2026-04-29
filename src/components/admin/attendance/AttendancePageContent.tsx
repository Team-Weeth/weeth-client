'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, Card } from '@/components/ui';
import { CardinalDropdown } from '@/components/admin';
import { useNavigationGuard, useCardinalSelector } from '@/hooks';
import { useFlattenedSessions } from '@/hooks/admin';
import { formatKoreanDate } from '@/lib/formatTime';

import { AttendanceSessionCard } from './AttendanceSessionCard';

function AttendancePageContent() {
  const { cardinals, setSelectedCardinalId, activeCardinal } = useCardinalSelector({
    autoSelectLatest: true,
  });
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
    (id: number) => {
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
  const { sessions } = useFlattenedSessions(cardinalNumber);

  const searchParams = useSearchParams();
  const targetSessionIdParam = searchParams.get('sessionId');
  const targetSessionId = targetSessionIdParam ? Number(targetSessionIdParam) : null;
  const targetCardRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    if (hasScrolledRef.current) return;
    if (targetSessionId === null) return;
    if (!sessions.some((s) => s.id === targetSessionId)) return;

    targetCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    hasScrolledRef.current = true;
  }, [sessions, targetSessionId]);

  return (
    <div className="flex min-w-3xl flex-col gap-400 p-700">
      <CardinalDropdown
        cardinals={cardinals}
        activeCardinal={activeCardinal}
        onSelect={handleCardinalSelect}
      />

      {sessions.length > 0 ? (
        <Card className="mt-400 gap-400 px-600 pt-600 pb-[64px]">
          {sessions.map((session) => {
            const isTarget = session.id === targetSessionId;
            return (
              <div key={session.id} ref={isTarget ? targetCardRef : undefined}>
                <AttendanceSessionCard
                  sessionId={session.id}
                  date={formatKoreanDate(new Date(session.start))}
                  title={session.title}
                  isCurrentWeek={session.isCurrentWeek}
                  defaultExpanded={isTarget}
                  onDirtyChange={handleDirtyChange}
                />
              </div>
            );
          })}
        </Card>
      ) : (
        <Card className="mt-400 flex items-center justify-center px-600 py-800">
          <span className="typo-body1 text-text-alternative">
            {activeCardinal ? '등록된 정기모임이 없습니다.' : '기수를 선택해 주세요.'}
          </span>
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
