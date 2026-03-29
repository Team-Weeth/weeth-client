'use client';

import { useState } from 'react';

import { LoginCard } from '@/components/auth';
import { TermsAgreementModal } from '@/components/auth';
import { Button } from '@/components/ui';

export default function LoginPage() {
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10">
      <div className="typo-h3 text-text-strong text-center">
        우리 동아리만의 공간을 만들어보세요
        <br />
        Weeth에서 함께 활동을 이어가세요
      </div>
      <LoginCard />

      {/* 약관 동의 모달 예시 */}
      <Button variant="secondary" size="md" onClick={() => setTermsOpen(true)}>
        약관 동의 모달 열기
      </Button>
      <TermsAgreementModal
        open={termsOpen}
        onOpenChange={setTermsOpen}
        onAgree={() => {
          console.log('약관 동의 완료');
        }}
      />
    </div>
  );
}
