import { PRIVACY_DATA } from '@/constants/term';
import { PolicyBody } from './PolicyBody';

interface PrivacyBodyProps {
  className?: string;
}

function PrivacyBody({ className }: PrivacyBodyProps) {
  return <PolicyBody data={PRIVACY_DATA} className={className} />;
}

export { PrivacyBody, type PrivacyBodyProps };
