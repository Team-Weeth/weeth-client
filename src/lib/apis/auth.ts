import { apiServer } from './server';

interface AgreeTermsResponse {
  data: {
    accessToken?: string;
    refreshToken?: string;
  };
  message?: string;
}

async function agreeTerms() {
  return apiServer.post<AgreeTermsResponse>('/users/terms', {
    termsAgreed: true,
    privacyAgreed: true,
  });
}

export const authApi = {
  agreeTerms,
};

export type { AgreeTermsResponse };
