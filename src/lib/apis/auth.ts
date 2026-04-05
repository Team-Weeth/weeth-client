import { API_BASE_PATH } from '@/constants/api';

interface AgreeTermsResponse {
  data: {
    accessToken?: string;
    refreshToken?: string;
  };
  message?: string;
}

async function agreeTerms(accessToken: string) {
  return fetch(`${API_BASE_PATH}/users/terms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ termsAgreed: true, privacyAgreed: true }),
  });
}

export const authApi = {
  agreeTerms,
};

export type { AgreeTermsResponse };
