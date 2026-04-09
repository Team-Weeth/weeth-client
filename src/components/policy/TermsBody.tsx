import { TERMS_DATA } from '@/constants/term';
import { PolicyBody } from './PolicyBody';

interface TermsBodyProps {
  className?: string;
}

function TermsBody({ className }: TermsBodyProps) {
  return <PolicyBody data={TERMS_DATA} className={className} />;
}

export { TermsBody, type TermsBodyProps };
