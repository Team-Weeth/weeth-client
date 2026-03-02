'use client';

import { AttendanceProgressBar } from '@/components/attendance/AttendanceProgressBar';
import { Card } from '@/components/ui/card';

export default function AttendancePage() {
  return (
    <div className="flex flex-col gap-6 px-6">
      <AttendanceProgressBar attendanceRate={80} />

      <Card
        variant="buttonSet"
        overline="오늘의 출석"
        title="프론트엔드 중간 발표"
        description="날짜: 2024년 7월 18일 (7:00 PM~8:30 PM)\n장소: 가천관 247호"
        onPrimaryClick={() => console.log('출석하기')}
        onSecondaryClick={() => console.log('출석코드 확인')}
        showArrow
      />
    </div>
  );
}
