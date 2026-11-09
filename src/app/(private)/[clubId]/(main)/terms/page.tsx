import type { Metadata } from 'next';
import { PolicyContent, TermsBody } from '@/components/policy';
import { TERMS_DATA } from '@/constants/term';

export const metadata: Metadata = { title: '이용약관' };

export default function TermsPage() {
  return (
    <PolicyContent title={TERMS_DATA.title}>
      <TermsBody />
    </PolicyContent>
  );
}
