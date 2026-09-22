import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useHomeQuery } from '@/hooks/home';
import { useClubId } from '@/stores/useClubStore';
import { useRouter } from 'next/navigation';

export function UserProfileHeader() {
  const router = useRouter();
  const clubId = useClubId();
  const { data: myInfo } = useHomeQuery({
    select: (data) => data.myInfo,
  });
  const { userInfo, bio } = myInfo ?? {};

  return (
    <div className="flex items-center gap-4 px-200 py-300">
      <button
        type="button"
        aria-label="마이페이지로 이동"
        disabled={!clubId}
        onClick={() => clubId && router.push(`/${clubId}/mypage`)}
        className="cursor-pointer rounded-full disabled:cursor-not-allowed"
      >
        <Avatar type="round">
          <AvatarImage
            key={userInfo?.profileImageUrl ?? 'fallback'}
            width={64}
            height={64}
            alt="프로필"
            src={userInfo?.profileImageUrl ?? undefined}
          />
          <AvatarFallback />
        </Avatar>
      </button>
      <div className="flex w-[172px] flex-col justify-center gap-[2px]">
        <p className="text-text-strong typo-sub1">{userInfo?.name}</p>
        <p className="text-text-normal typo-body2">{bio ?? ''}</p>
      </div>
    </div>
  );
}
