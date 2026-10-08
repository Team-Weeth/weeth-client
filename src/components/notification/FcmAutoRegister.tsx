'use client';

import { useEffect } from 'react';
import { getFcmPreference, setFcmPreference } from '@/lib/push/preference';
import { isNativeApp } from '@/lib/push/platform';
import {
  getPermission,
  registerTokenIfGranted,
  requestPermissionAndRegister,
} from '@/lib/push/webPush';

// 페이지 로드당 1회만 실행 (레이아웃 다중 마운트/SPA 네비게이션 중복 방지)
let hasRun = false;

/**
 * 로그인 직후(인증 영역 진입 시) 웹 푸시 토큰을 등록하는 비가시 컴포넌트.
 *
 * - 권한 granted: 조용히 토큰 재등록 (토큰 회전/계정 변경 대응)
 * - 권한 default + 미결정: 1회 권한 요청 (로그인 직후 프롬프트)
 * - 권한 denied 또는 사용자가 알림 끔(disabled): 아무것도 하지 않음
 *
 * 네이티브(Capacitor)에서는 동작하지 않으며, 추후 플러그인 경로에서 별도 처리한다.
 */
export function FcmAutoRegister() {
  useEffect(() => {
    if (hasRun || isNativeApp()) return;
    hasRun = true;

    const permission = getPermission();
    if (permission === 'unsupported' || permission === 'denied') return;

    const preference = getFcmPreference();
    if (preference === 'disabled') return;

    if (permission === 'granted') {
      registerTokenIfGranted()
        .then((token) => {
          if (token && preference === 'unset') setFcmPreference('enabled');
        })
        .catch(() => {});
      return;
    }

    // permission === 'default' && preference === 'unset'
    if (preference === 'unset') {
      requestPermissionAndRegister()
        .then(({ permission: result, token }) => {
          if (result === 'granted' && token) setFcmPreference('enabled');
          else if (result === 'denied') setFcmPreference('disabled');
        })
        .catch(() => {});
    }
  }, []);

  return null;
}
