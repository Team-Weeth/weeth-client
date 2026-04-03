import { API_BASE_PATH } from '@/constants/api';

interface LoginResponse {
  data: {
    accessToken?: string;
    refreshToken?: string;
  };
  message?: string;
}

interface AgreeTermsResponse {
  data: {
    accessToken?: string;
    refreshToken?: string;
  };
  message?: string;
}

async function login(email: string, password: string) {
  return fetch(`${API_BASE_PATH}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
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
  login,
  agreeTerms,
};

export type { LoginResponse, AgreeTermsResponse };
