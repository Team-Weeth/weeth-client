import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import {
  ACCESS_COOKIE_OPTIONS,
  ACCESS_TOKEN_KEY,
  CLUB_COOKIE_OPTIONS,
  CLUB_ID_KEY,
  CLUB_NAME_KEY,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN_KEY,
} from '@/lib/apis/cookies';

function isDevLoginEnabled() {
  if (process.env.NODE_ENV === 'production') return false;
  return process.env.NODE_ENV === 'development' || process.env.ENABLE_DEV_LOGIN === 'true';
}

async function devLoginAction(formData: FormData) {
  'use server';

  if (!isDevLoginEnabled()) {
    notFound();
  }

  const accessToken = String(formData.get('accessToken') ?? '').trim();
  const refreshToken = String(formData.get('refreshToken') ?? '').trim();
  const clubId = String(formData.get('clubId') ?? '').trim();
  const clubName = String(formData.get('clubName') ?? '').trim();
  const redirectPath = String(formData.get('redirectPath') ?? '').trim();

  if (!accessToken || !refreshToken) {
    redirect('/dev-login?error=missing-token');
  }

  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_KEY, accessToken, ACCESS_COOKIE_OPTIONS);
  cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, REFRESH_COOKIE_OPTIONS);

  if (clubId) {
    cookieStore.set(CLUB_ID_KEY, clubId, CLUB_COOKIE_OPTIONS);
  }

  if (clubName) {
    cookieStore.set(CLUB_NAME_KEY, clubName, CLUB_COOKIE_OPTIONS);
  }

  if (redirectPath.startsWith('/') && !redirectPath.startsWith('//')) {
    redirect(redirectPath);
  }

  redirect(clubId ? `/${clubId}/home` : '/hub');
}

export default async function DevLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!isDevLoginEnabled()) {
    notFound();
  }

  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col justify-center px-6 py-10">
      <div className="space-y-3">
        <p className="typo-body2 text-text-alternative">Local app development</p>
        <h1 className="typo-heading1 text-text-normal">Dev Login</h1>
        <p className="typo-body2 text-text-alternative">
          카카오 로그인을 우회해서 로컬 WebView에 개발용 토큰을 심습니다.
        </p>
      </div>

      <form action={devLoginAction} className="mt-8 space-y-5">
        <label className="block space-y-2">
          <span className="typo-body2 text-text-normal">Access token</span>
          <textarea
            name="accessToken"
            required
            rows={4}
            className="border-line-normal bg-background-normal text-text-normal focus:border-primary-normal w-full resize-y rounded-lg border px-4 py-3 text-sm outline-none"
            placeholder="accessToken"
          />
        </label>

        <label className="block space-y-2">
          <span className="typo-body2 text-text-normal">Refresh token</span>
          <textarea
            name="refreshToken"
            required
            rows={4}
            className="border-line-normal bg-background-normal text-text-normal focus:border-primary-normal w-full resize-y rounded-lg border px-4 py-3 text-sm outline-none"
            placeholder="refreshToken"
          />
        </label>

        <label className="block space-y-2">
          <span className="typo-body2 text-text-normal">Club ID</span>
          <input
            name="clubId"
            className="border-line-normal bg-background-normal text-text-normal focus:border-primary-normal w-full rounded-lg border px-4 py-3 text-sm outline-none"
            placeholder="예: club id"
          />
        </label>

        <label className="block space-y-2">
          <span className="typo-body2 text-text-normal">Club name</span>
          <input
            name="clubName"
            className="border-line-normal bg-background-normal text-text-normal focus:border-primary-normal w-full rounded-lg border px-4 py-3 text-sm outline-none"
            placeholder="예: Weeth"
          />
        </label>

        <label className="block space-y-2">
          <span className="typo-body2 text-text-normal">Redirect path</span>
          <input
            name="redirectPath"
            className="border-line-normal bg-background-normal text-text-normal focus:border-primary-normal w-full rounded-lg border px-4 py-3 text-sm outline-none"
            placeholder="비워두면 /{clubId}/home 또는 /hub"
          />
        </label>

        {error === 'missing-token' && (
          <p className="typo-caption1 text-status-negative">
            access token과 refresh token을 모두 입력해야 합니다.
          </p>
        )}

        <button
          type="submit"
          className="bg-primary-normal text-static-white h-12 w-full rounded-lg text-base font-semibold"
        >
          토큰 저장하고 이동
        </button>
      </form>
    </main>
  );
}
