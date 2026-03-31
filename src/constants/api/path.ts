import { BASE_URL } from './env';

export const API_BASE_PATH =
  typeof window === 'undefined' ? `${BASE_URL}/api/v4` : '/api/proxy/api/v4';
