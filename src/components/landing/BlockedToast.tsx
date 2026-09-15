'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toastWarning } from '@/stores/useToastStore';

function BlockedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const blocked = searchParams.get('blocked');

  useEffect(() => {
    if (blocked === 'true') {
      toastWarning('아직 서비스 런칭 전이에요!');
      router.replace('/landing');
    }
  }, [blocked, router]);

  return null;
}

export { BlockedToast };
