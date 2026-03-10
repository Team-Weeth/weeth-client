import { MemberTable } from '@/components/admin';
import { MemberSearchBar } from '@/components/admin/member/MemberSearchBar';
import { Card } from '@/components/ui';

export default function MemberPage() {
  return (
    <div className="flex h-screen flex-col gap-1">
      <MemberSearchBar />
      <Card>
        <MemberTable />
      </Card>
    </div>
  );
}
