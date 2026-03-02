'use client';

import { AttendanceProgressBar } from '@/components/attendance/AttendanceProgressBar';
import { Card, Button, Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui';
import { useModalStore } from '@/stores';

export default function AttendancePage() {
  const { open, close } = useModalStore();

  return (
    <div className="flex flex-col gap-6 px-450">
      <AttendanceProgressBar attendanceRate={80} />

      <Card
        variant="buttonSet"
        overline="오늘의 출석"
        title="프론트엔드 중간 발표"
        description="날짜: 2024년 7월 18일 (7:00 PM~8:30 PM)\n장소: 가천관 247호"
        onPrimaryClick={open}
        onSecondaryClick={() => console.log('출석코드 확인')}
      />
      <Card variant="onlyText" overline="출석" title="출석 기록" />

      {/* 모달 예시 */}
      <Modal>
        <ModalHeader title="QR 출석하기" />
        <ModalBody>
          <div className="bg-container-primary-alternative flex flex-col items-center gap-300 rounded-lg p-400">
            <p className="typo-sub1 text-text-strong">운영진이 공유한 6자리 출석 코드를 입력하세요</p>
            <p className="typo-body2 text-text-alternative">
              QR 스캔이 어려운 경우 코드를 직접 입력할 수 있어요
            </p>
          </div>
          <div className="flex flex-col items-center gap-300">
            <div className="flex gap-200">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div
                  key={num}
                  className="bg-container-neutral-alternative flex h-12 w-12 items-center justify-center rounded-lg"
                >
                  <span className="typo-h3 text-text-strong">{num === 1 ? '2' : ''}</span>
                </div>
              ))}
            </div>
            <p className="typo-body2 text-brand-primary">출석 가능 시간 10:00</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" size="lg" onClick={close}>
            출석 확인하기
          </Button>
          <p className="typo-body2 text-text-alternative text-center">
            모바일에서는 QR코드를 카메라로 스캔할 수 있어요.
          </p>
        </ModalFooter>
      </Modal>
    </div>
  );
}
