import { Capacitor } from '@capacitor/core';
import type { PushPlatform } from '@/lib/apis/notification';

/** Capacitor 네이티브 앱(WebView) 안에서 실행 중인지 여부 */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/** 현재 실행 플랫폼을 백엔드 enum 값으로 변환 */
export function getPushPlatform(): PushPlatform {
  switch (Capacitor.getPlatform()) {
    case 'android':
      return 'ANDROID';
    case 'ios':
      return 'IOS';
    default:
      return 'WEB';
  }
}
