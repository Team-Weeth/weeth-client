import { DuesContent } from '@/components/dues';
import { ApiError, apiServer } from '@/lib/apis/server';
import type { ApiResponse } from '@/types/common';
import type { DuesVisibilityResponse } from '@/types/dues';

interface DuesPageProps {
  params: Promise<{ clubId: string }>;
}

export default async function DuesPage({ params }: DuesPageProps) {
  const { clubId } = await params;
  let response: ApiResponse<DuesVisibilityResponse>;

  try {
    response = await apiServer.get<ApiResponse<DuesVisibilityResponse>>(
      `/clubs/${clubId}/accounts/settings/visibility`,
      { cache: 'no-store' },
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return <DuesContent initialIsPrivate />;
    }

    throw error;
  }

  return <DuesContent initialIsPrivate={!response.data.visible} />;
}
