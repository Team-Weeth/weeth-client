import { DuesInteractiveContent } from '@/components/dues/DuesInteractiveContent';
import { DuesPageLayout } from '@/components/dues/DuesPageLayout';
import { DuesPrivateState } from '@/components/dues/DuesStatusState';

interface DuesContentProps {
  initialIsPrivate?: boolean;
}

function DuesContent({ initialIsPrivate = false }: DuesContentProps) {
  if (initialIsPrivate) {
    return (
      <DuesPageLayout cardinals={[]}>
        <DuesPrivateState />
      </DuesPageLayout>
    );
  }

  return <DuesInteractiveContent />;
}

export { DuesContent };
