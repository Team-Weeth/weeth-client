'use client';

import { useState } from 'react';

import { agreeTermsAction } from '@/lib/actions/auth';
import { encodeOAuthState } from '@/lib/auth/oauthState';
import { toastError } from '@/stores/useToastStore';

import { LoginCard } from './LoginCard';
import { TermsAgreementModal } from './TermsAgreementModal';

interface LoginPageClientProps {
  defaultTermsOpen?: boolean;
  intent?: string;
  clubId?: string;
  code?: string;
  redirectPath?: string;
}

function LoginPageClient({
  defaultTermsOpen = false,
  intent,
  clubId,
  code,
  redirectPath,
}: LoginPageClientProps) {
  const [termsOpen, setTermsOpen] = useState(defaultTermsOpen);
  const [isLoading, setIsLoading] = useState(false);

  function handleKakaoLoginStart() {
    const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
    const params = new URLSearchParams({ response_type: 'code' });
    if (clientId) params.set('client_id', clientId);
    if (redirectUri) params.set('redirect_uri', `${window.location.origin}${redirectUri}`);

    const state = encodeOAuthState({ intent, clubId, code, redirectPath });
    if (state) params.set('state', state);

    setIsLoading(true);
    window.location.href = `https://kauth.kakao.com/oauth/authorize?${params}`;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10">
      <div className="typo-h3 text-text-strong text-center">
        우리 동아리만의 공간을 만들어보세요
        <br />
        Weeth에서 함께 활동을 이어가세요
      </div>
      <LoginCard isLoading={isLoading} onKakaoLogin={handleKakaoLoginStart} />
      <TermsAgreementModal
        open={termsOpen}
        onOpenChange={setTermsOpen}
        onAgree={async () => {
          const result = await agreeTermsAction(intent, clubId, code, redirectPath);
          if (result?.error) toastError(result.error);
        }}
      />
    </div>
  );
}

export { LoginPageClient };
