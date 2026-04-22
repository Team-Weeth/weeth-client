import { PolicyContent, PrivacyBody } from '@/components/policy';
import { PRIVACY_DATA } from '@/constants/term';

export default function PrivacyPage() {
  return (
    <PolicyContent title={PRIVACY_DATA.title}>
      <PrivacyBody />
    </PolicyContent>
  );
}
