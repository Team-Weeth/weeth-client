'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui';
import { useAttendanceSSE, useAttendanceQR } from '@/hooks/attendance';
import { useRemainingTime } from '@/hooks/useRemainingTime';
import { useClubId } from '@/stores/useClubStore';

interface AttendanceQRContentProps {
  sessionId: number;
}

function AttendanceQRContent({ sessionId }: AttendanceQRContentProps) {
  const { clubId: clubIdParam } = useParams<{ clubId: string }>();
  const clubId = useClubId();
  const { qrRef, qrData, isLoading } = useAttendanceQR(clubId, sessionId);
  const { expiredAt: sseExpiredAt } = useAttendanceSSE();
  const { minutes, seconds, isExpired } = useRemainingTime(sseExpiredAt ?? '');

  return (
    <div className="mx-auto flex w-full max-w-[1025px] flex-col gap-700 pt-600">
      <Breadcrumb className="px-450">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href={`/${clubIdParam}/attendance`}
                className="typo-caption1 text-text-alternative"
              >
                출석
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="typo-caption1 text-text-alternative">
              오늘의 출석
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-700 px-450">
        <div className="flex w-full flex-col items-center gap-200 text-center">
          <h1 className="typo-h3 text-text-strong">
            QR코드를 카메라로 스캔하여 빠르게 출석해보세요.
          </h1>
          <p className="typo-body2 text-text-alternative">
            QR 스캔이 정상적으로 진행되지 않으면 하단의 출석 코드를 입력해주세요.
          </p>
        </div>

        <div className="bg-container-neutral flex w-full flex-col items-center gap-400 rounded-lg p-400">
          <div className="flex w-full flex-col items-center gap-600 p-400">
            {isLoading ? (
              <div className="flex h-[256px] w-[256px] items-center justify-center">
                <p className="typo-body2 text-text-alternative">QR 코드 생성 중...</p>
              </div>
            ) : (
              <>
                <div ref={qrRef} />

                <div className="flex w-full flex-col items-center gap-200">
                  <div className="flex items-center gap-200">
                    <span className="typo-sub3 text-text-strong">출석 가능 시간</span>
                    <span className="typo-sub3 text-state-error tabular-nums">
                      {!sseExpiredAt ? '연결 중...' : isExpired ? '마감' : `${minutes}:${seconds}`}
                    </span>
                  </div>
                  <p className="typo-body2 text-text-strong">QR코드는 모바일만 제공하고 있어요.</p>
                </div>

                <p className="typo-h1 text-text-strong">{qrData?.code}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { AttendanceQRContent, type AttendanceQRContentProps };
