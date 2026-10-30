import { notFound } from 'next/navigation';

import { getClubFeatures } from '@/flags/club-features/server';
import { FeedbackPageContent } from '@/components/mypage/feedback/FeedbackPageContent';

export const dynamic = 'force-dynamic';

interface MyPageFeedbackPageProps {
  params: Promise<{ clubId: string }>;
}

export default async function MyPageFeedbackPage({ params }: MyPageFeedbackPageProps) {
  const { clubId } = await params;
  const features = await getClubFeatures(clubId);

  // 서비스 피드백 A안(FAB) 동아리는 설정 폼(B안) 경로로 직접 접근해도 노출하지 않는다.
  if (features.feedbackFabEnabled) notFound();

  return <FeedbackPageContent />;
}
