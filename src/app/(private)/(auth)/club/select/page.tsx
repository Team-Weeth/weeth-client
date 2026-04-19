import { redirect, unstable_rethrow } from 'next/navigation';
import { ClubList, HubProfile } from '@/components/auth/hub';
import { setClubCookie } from '@/lib/actions/club';
import { apiServer } from '@/lib/apis/server';
import type { ApiResponse } from '@/types/common';
import type { ClubDto } from '@/types/mypage';

export default async function ClubSelectPage() {
  const res = await apiServer.get<ApiResponse<ClubDto[]>>('/clubs').catch((err) => {
    unstable_rethrow(err);
    return null;
  });

  const clubs = res?.data ?? [];

  // if (clubs.length === 1) {
  //   const club = clubs[0];
  //   await setClubCookie(club.id, club.name);
  //   redirect('/home');
  // }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-600">
      <HubProfile
        className="flex flex-col items-center gap-600"
        description="즐거운 동아리 활동을 이어나가요"
      />
      <div className="flex w-full max-w-[620px] flex-col gap-300 px-400">
        <ClubList clubs={clubs} />
      </div>
    </div>
  );
}
