'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AttendanceProgressBar } from '@/components/attendance/AttendanceProgressBar';
import { Card, Button, Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui';
import { useModalStore } from '@/stores';
import DummyImage from '@/assets/icons/dummy.svg';

export default function AttendancePage() {
  const { open, close } = useModalStore();
  const [simpleModalOpen, setSimpleModalOpen] = useState(false);
  const [paginationModalOpen, setPaginationModalOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

      {/* 모달 예시 버튼들 */}
      <div className="flex flex-col gap-300">
        <p className="typo-sub1 text-text-strong">모달 예시</p>
        <div className="flex gap-200">
          <Button variant="secondary" size="md" onClick={() => setSimpleModalOpen(true)}>
            간단한 모달
          </Button>
          <Button variant="secondary" size="md" onClick={() => setPaginationModalOpen(true)}>
            페이지네이션 모달
          </Button>
          <Button variant="secondary" size="md" onClick={() => setCustomModalOpen(true)}>
            커스텀 헤더 모달
          </Button>
          <Button variant="secondary" size="md" onClick={() => setOnboardingModalOpen(true)}>
            온보딩 모달
          </Button>
        </div>
      </div>

      {/* 모달 1: Zustand store 사용 (overline + title + description + footer description) */}
      <Modal>
        <ModalHeader
          overline="출석 확인"
          title="QR 출석하기"
          description="운영진이 공유한 QR 코드를 스캔하거나 6자리 출석 코드를 입력하세요"
        />
        <ModalBody>
          <div className="bg-container-primary-alternative flex flex-col items-center gap-300 rounded-lg p-400">
            <p className="typo-sub1 text-text-strong">
              운영진이 공유한 6자리 출석 코드를 입력하세요
            </p>
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
        <ModalFooter description="모바일에서는 QR코드를 카메라로 스캔할 수 있어요.">
          <Button variant="primary" size="lg" onClick={close}>
            출석 확인하기
          </Button>
        </ModalFooter>
      </Modal>

      {/* 모달 2: 간단한 모달 (title만) */}
      <Modal open={simpleModalOpen} onOpenChange={setSimpleModalOpen}>
        <ModalHeader title="알림" />
        <ModalBody>
          <p className="typo-body1 text-text-normal">출석이 완료되었습니다!</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" size="lg" onClick={() => setSimpleModalOpen(false)}>
            확인
          </Button>
        </ModalFooter>
      </Modal>

      {/* 모달 3: 페이지네이션 모달 */}
      <Modal open={paginationModalOpen} onOpenChange={setPaginationModalOpen}>
        <ModalHeader overline="출석 기록" title="7월 출석 현황" />
        <ModalBody>
          <div className="flex flex-col gap-300">
            <div className="bg-container-neutral-alternative rounded-lg p-400">
              <p className="typo-body2 text-text-normal">2024년 7월 1일 - 출석 완료</p>
            </div>
            <div className="bg-container-neutral-alternative rounded-lg p-400">
              <p className="typo-body2 text-text-normal">2024년 7월 8일 - 출석 완료</p>
            </div>
            <div className="bg-container-neutral-alternative rounded-lg p-400">
              <p className="typo-body2 text-text-normal">2024년 7월 15일 - 결석</p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter
          pagination={
            <div className="flex items-center justify-center gap-300">
              <Button variant="secondary" size="sm">
                이전
              </Button>
              <span className="typo-body2 text-text-normal">1 / 3</span>
              <Button variant="secondary" size="sm">
                다음
              </Button>
            </div>
          }
        >
          <Button variant="primary" size="lg" onClick={() => setPaginationModalOpen(false)}>
            닫기
          </Button>
        </ModalFooter>
      </Modal>

      {/* 모달 4: 커스텀 헤더 (children 사용) */}
      <Modal open={customModalOpen} onOpenChange={setCustomModalOpen}>
        <ModalHeader showClose={false}>
          <div className="flex items-center gap-200">
            <div className="bg-brand-primary flex h-10 w-10 items-center justify-center rounded-full">
              <span className="typo-sub1 text-text-inverse">✓</span>
            </div>
            <h2 className="typo-sub1 text-text-strong">출석 성공</h2>
          </div>
        </ModalHeader>
        <ModalBody>
          <p className="typo-body1 text-text-normal">출석이 성공적으로 처리되었습니다.</p>
        </ModalBody>
        <ModalFooter showDivider={false}>
          <Button variant="primary" size="lg" onClick={() => setCustomModalOpen(false)}>
            확인
          </Button>
        </ModalFooter>
      </Modal>

      {/* 모달 5: 온보딩 모달 (이미지 참조) */}
      <Modal open={onboardingModalOpen} onOpenChange={setOnboardingModalOpen}>
        <ModalHeader
          overline="사이트 완성하기"
          title="동아리의 프로필과 배경화면을 설정해서 사이트를 꾸며보세요!"
          description="관리자 서비스에서 언제든 수정할 수 있어요."
        />
        <ModalBody>
          {/* 이미지 영역 */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image src={DummyImage} alt="웹사이트 미리보기" fill className="object-cover" />
          </div>
          {/* 설정하러 가기 링크 */}
          <p className="typo-body2 text-text-alternative text-center">설정하러 가기</p>
        </ModalBody>
        <ModalFooter
          pagination={
            <div className="flex items-center justify-center gap-300">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="typo-body2 text-text-alternative disabled:opacity-50"
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              <span className="typo-body2 text-text-normal">{currentPage} / 4</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(4, prev + 1))}
                className="typo-body2 text-text-alternative disabled:opacity-50"
                disabled={currentPage === 4}
              >
                &gt;
              </button>
            </div>
          }
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              if (currentPage < 4) {
                setCurrentPage((prev) => prev + 1);
              } else {
                setOnboardingModalOpen(false);
                setCurrentPage(1);
              }
            }}
          >
            다음
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
