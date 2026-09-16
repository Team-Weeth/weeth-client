import { notFound } from 'next/navigation';
import { MemberInformationPreview } from './MemberInformationPreview';

export default function MemberInformationPreviewPage() {
  if (process.env.NODE_ENV !== 'development') notFound();

  return <MemberInformationPreview />;
}
