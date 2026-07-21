import { useQueries, useQuery } from '@tanstack/react-query';
import { mypageApi } from '@/lib/apis/mypage';
import type { MyPageSummary, MyPageUsingProfile } from '@/types/mypage';

const MYPAGE_SUMMARY_STALE_TIME = 10 * 60 * 1000;
const MYPAGE_SUMMARY_GC_TIME = 30 * 60 * 1000;

export function getCurrentProfileByClubId(summary: MyPageSummary | undefined, clubId: string) {
  const usingProfiles = summary?.usingProfiles ?? [];

  return (
    usingProfiles.find((profile) => profile.clubs.some((club) => club.clubId === clubId)) ??
    usingProfiles[0]
  );
}

export function useMyPageSummaryQuery() {
  return useQuery({
    queryKey: ['mypage', 'summary'],
    queryFn: () => mypageApi.getMyPageSummary().then((res) => res.data.data),
    staleTime: MYPAGE_SUMMARY_STALE_TIME,
    gcTime: MYPAGE_SUMMARY_GC_TIME,
  });
}

export function useCurrentClubProfile(clubId: string): {
  summaryQuery: ReturnType<typeof useMyPageSummaryQuery>;
  currentProfile: MyPageUsingProfile | undefined;
} {
  const summaryQuery = useMyPageSummaryQuery();

  return {
    summaryQuery,
    currentProfile: getCurrentProfileByClubId(summaryQuery.data, clubId),
  };
}

export function useMyPageQueries(clubId: string) {
  const summaryQuery = useMyPageSummaryQuery();

  const me = summaryQuery.data?.user;
  const stats = summaryQuery.data?.stats;
  const usingProfiles = summaryQuery.data?.usingProfiles ?? [];
  const currentProfile = getCurrentProfileByClubId(summaryQuery.data, clubId);
  const rawClubs = usingProfiles.flatMap((profile) =>
    profile.clubs.map((club) => ({
      id: club.clubId,
      name: club.name,
      schoolName: '',
      description: profile.bio ?? '',
      profileImageUrl: profile.profileImageUrl ?? '',
      memberCount: 0,
      cardinals: [],
      memberRole: 'USER' as const,
      memberStatus: 'ACTIVE' as const,
    })),
  );
  const deduplicatedClubs = Array.from(new Map(rawClubs.map((club) => [club.id, club])).values());

  const clubSummaryQueries = useQueries({
    queries: deduplicatedClubs.map((club) => ({
      queryKey: ['mypage', 'club-summary', club.id],
      queryFn: () => mypageApi.getMyClubMemberSummary(club.id).then((res) => res.data.data),
      enabled: Boolean(summaryQuery.data),
      staleTime: MYPAGE_SUMMARY_STALE_TIME,
      gcTime: MYPAGE_SUMMARY_GC_TIME,
    })),
  });

  const clubs = deduplicatedClubs.map((club, index) => {
    const clubSummary = clubSummaryQueries[index]?.data;

    return {
      ...club,
      cardinals: clubSummary?.cardinals ?? [],
      memberRole: clubSummary?.role ?? club.memberRole,
    };
  });

  return {
    summaryQuery,
    me,
    stats,
    currentProfile,
    usingProfiles,
    clubs,
  };
}
