import { redirect } from 'next/navigation';

interface AdminRootPageProps {
  params: Promise<{ clubId: string }>;
}

export default async function AdminRootPage({ params }: AdminRootPageProps) {
  const { clubId } = await params;
  redirect(`/${clubId}/admin/member`);
}
