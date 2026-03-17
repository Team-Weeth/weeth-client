import { HubActionCard, HubProfile } from '@/components/auth/hub';

export default function HubPage() {
  return (
    <div className="flex flex-col items-center gap-600 py-[80px]">
      <HubProfile className="flex flex-col items-center gap-600" />
      <div className="flex w-full max-w-[520px] flex-col gap-300 px-400">
        <HubActionCard variant="create" href="/hub/create" />
        <HubActionCard variant="join" href="/hub/join" />
        <HubActionCard variant="go" />
      </div>
    </div>
  );
}
