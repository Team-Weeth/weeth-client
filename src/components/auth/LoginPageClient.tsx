'use client';

import { useEffect, useState } from 'react';

import { agreeTermsAction } from '@/lib/actions/auth';
import { APPLE_PENDING_STATE_KEY } from '@/constants/apple';
import { encodeOAuthState } from '@/lib/auth/oauthState';
import { toastError } from '@/stores/useToastStore';

import dynamic from 'next/dynamic';

import { LoginCard } from './LoginCard';

const TermsAgreementModal = dynamic(() =>
  import('./TermsAgreementModal').then((m) => m.TermsAgreementModal),
);

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

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setIsLoading(false);
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  function handleAppleLoginStart() {
    const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI;
    if (!clientId || !redirectUri) return;

    // Apple
    // intent/clubId/code를 쿠키에 임시 저장해 /apple/oauth route에서 읽어 분기.
    const pendingState = encodeOAuthState({ intent, clubId, code, redirectPath });
    if (pendingState) {
      document.cookie = `${APPLE_PENDING_STATE_KEY}=${encodeURIComponent(pendingState)}; path=/; max-age=600; secure; samesite=lax`;
    } else {
      document.cookie = `${APPLE_PENDING_STATE_KEY}=; path=/; max-age=0; secure; samesite=lax`;
    }

    const params = new URLSearchParams({
      response_type: 'code id_token',
      response_mode: 'form_post',
      scope: 'name email',
      client_id: clientId,
      redirect_uri: redirectUri,
    });

    setIsLoading(true);
    window.location.href = `https://appleid.apple.com/auth/authorize?${params}`;
  }

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
      <LoginCard
        isLoading={isLoading}
        onKakaoLogin={handleKakaoLoginStart}
        onAppleLogin={handleAppleLoginStart}
      />
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
