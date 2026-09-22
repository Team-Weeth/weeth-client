import { HubProfile } from '@/components/auth/hub/HubProfile';
import { InviteCodeForm } from '@/components/auth/hub/InviteCodeForm';

export default function JoinClubPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-[40px] px-400">
      <HubProfile
        className="flex flex-col items-center gap-400"
        description="즐거운 동아리 활동을 이어나가요"
      />
      <InviteCodeForm />
    </div>
  );
}
