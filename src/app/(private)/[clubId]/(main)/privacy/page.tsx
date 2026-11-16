import type { Metadata } from 'next';
import { PolicyContent, PrivacyBody } from '@/components/policy';
import { PRIVACY_DATA } from '@/constants/term';

export const metadata: Metadata = { title: '개인정보처리방침' };

export default function PrivacyPage() {
  return (
    <PolicyContent title={PRIVACY_DATA.title}>
      <PrivacyBody />
    </PolicyContent>
  );
}
