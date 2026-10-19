'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Switch } from '@/components/ui/Switch';
import { useFcmToken } from '@/hooks/useFcmToken';
import { getFcmPreference, setFcmPreference } from '@/lib/push/preference';
import { toastError, toastSuccess } from '@/stores/useToastStore';

type NotificationSettingItemProps = React.HTMLAttributes<HTMLDivElement>;

function NotificationSettingItem({ className, ...props }: NotificationSettingItemProps) {
  const { permission, isPending, enable, disable } = useFcmToken();
  // 사용자 의도(localStorage)는 최초 1회만 읽는다. permission이 초기 'unsupported'라
  // 첫 렌더의 checked는 항상 false → SSR/하이드레이션 불일치 없음.
  const [preferenceEnabled, setPreferenceEnabled] = useState(() => getFcmPreference() === 'enabled');

  // 실제 수신 여부 = 사용자 의도(enabled) AND 브라우저 권한(granted)
  const checked = preferenceEnabled && permission === 'granted';
  const unsupported = permission === 'unsupported';

  const handleChange = async (next: boolean) => {
    if (next) {
      try {
        const token = await enable();
        if (token) {
          setFcmPreference('enabled');
          setPreferenceEnabled(true);
          toastSuccess('알림을 받아요.');
        } else {
          setPreferenceEnabled(false);
          toastError('브라우저 설정에서 알림 권한을 허용해 주세요.');
        }
      } catch {
        setPreferenceEnabled(false);
        toastError('알림 설정을 변경하지 못했어요.');
      }
    } else {
      try {
        await disable();
        setFcmPreference('disabled');
        setPreferenceEnabled(false);
        toastSuccess('알림을 껐어요.');
      } catch {
        toastError('알림 설정을 변경하지 못했어요.');
      }
    }
  };

  return (
    <div
      className={cn('flex w-full items-center justify-between gap-100 px-400 py-300', className)}
      {...props}
    >
      <span className="typo-button1 text-text-strong">알림설정</span>
      <Switch
        checked={checked}
        onCheckedChange={handleChange}
        disabled={isPending || unsupported}
        aria-label="알림설정"
      />
    </div>
  );
}

export { NotificationSettingItem, type NotificationSettingItemProps };
