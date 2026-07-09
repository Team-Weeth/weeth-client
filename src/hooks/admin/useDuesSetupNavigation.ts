import { useRouter, useParams } from 'next/navigation';

function useDuesSetupNavigation() {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();

  const goToStep = (step: number) => router.push(`/${clubId}/admin/dues/setup/${step}`);
  const goToDues = () => router.replace(`/${clubId}/admin/dues`);

  return { goToStep, goToDues };
}

export { useDuesSetupNavigation };
