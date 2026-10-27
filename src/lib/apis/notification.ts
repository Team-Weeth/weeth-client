import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';

/** 푸시 토큰이 발급된 플랫폼. 웹 외 값은 추후 Capacitor 네이티브 경로에서 사용 */
export type PushPlatform = 'WEB' | 'ANDROID' | 'IOS';

export interface RegisterPushTokenBody {
  token: string;
  platform: PushPlatform;
}

export interface RevokePushTokenBody {
  token: string;
}

export const notificationApi = {
  /** 푸시 알림 토큰 등록 — POST /api/v4/notifications/tokens */
  registerToken: (body: RegisterPushTokenBody) =>
    apiClient.post<ApiResponse<string>>('/notifications/tokens', body),

  /** 푸시 알림 토큰 해제 — POST /api/v4/notifications/tokens/revoke */
  revokeToken: (body: RevokePushTokenBody) =>
    apiClient.post<ApiResponse<string>>('/notifications/tokens/revoke', body),
};
