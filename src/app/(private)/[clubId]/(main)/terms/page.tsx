import { PolicyContent, TermsBody } from '@/components/policy';
import { TERMS_DATA } from '@/constants/term';

export default function TermsPage() {
  return (
    <PolicyContent title={TERMS_DATA.title}>
      <TermsBody />
    </PolicyContent>
  );
}
