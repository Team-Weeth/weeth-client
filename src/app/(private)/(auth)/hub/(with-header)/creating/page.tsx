import { ClubCreatingPage } from '@/components/auth/hub';

interface HubLoadingPageProps {
  searchParams: Promise<{
    intent?: string;
  }>;
}

export default async function HubLoadingPage({ searchParams }: HubLoadingPageProps) {
  const { intent } = await searchParams;

  return <ClubCreatingPage intent={intent} />;
}
