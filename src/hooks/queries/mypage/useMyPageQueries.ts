import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { mypageApi, type MultiProfileResponse } from '@/lib/apis/mypage';
import type {
  ClubDto,
  MyPageActivityClub,
  MyPageAssignableClub,
  MyPageCurrentProfile,
  MyPageUsingProfile,
} from '@/types/mypage';

const MYPAGE_SUMMARY_STALE_TIME = 10 * 60 * 1000;
const MYPAGE_SUMMARY_GC_TIME = 30 * 60 * 1000;

function toMyPageUsingProfile(profile: MultiProfileResponse): MyPageUsingProfile {
  return {
    profileId: profile.profileId,
    name: profile.name,
    profileImageUrl: profile.profileImageUrl,
    headerImageUrl: profile.headerImageUrl,
    bio: profile.bio,
    clubs: profile.usingClubs,
  };
}

export function useMyPageSummaryQuery(clubId: string) {
  return useQuery({
    queryKey: ['mypage', 'summary', clubId],
    queryFn: () => mypageApi.getMyPageSummary(clubId).then((res) => res.data.data),
    enabled: Boolean(clubId),
    staleTime: MYPAGE_SUMMARY_STALE_TIME,
    gcTime: MYPAGE_SUMMARY_GC_TIME,
  });
}

export function useMyClubsQuery() {
  return useQuery({
    queryKey: ['mypage', 'clubs'],
    queryFn: () => mypageApi.getMyClubs().then((res) => res.data.data),
    staleTime: MYPAGE_SUMMARY_STALE_TIME,
    gcTime: MYPAGE_SUMMARY_GC_TIME,
  });
}

export function useMyProfilesQuery() {
  return useQuery({
    queryKey: ['mypage', 'profiles'],
    queryFn: () =>
      mypageApi
        .getMyProfiles()
        .then((res) => res.data.data.profiles.map((profile) => toMyPageUsingProfile(profile))),
    staleTime: MYPAGE_SUMMARY_STALE_TIME,
    gcTime: MYPAGE_SUMMARY_GC_TIME,
  });
}

export function useMyProfileDetailQuery(profileId: number | null) {
  return useQuery({
    queryKey: ['mypage', 'profiles', profileId],
    queryFn: () =>
      mypageApi
        .getMyProfileDetail(profileId as number)
        .then((res) => toMyPageUsingProfile(res.data.data)),
    enabled: profileId !== null,
    staleTime: MYPAGE_SUMMARY_STALE_TIME,
    gcTime: MYPAGE_SUMMARY_GC_TIME,
  });
}

export function useAssignableClubsQuery() {
  return useQuery({
    queryKey: ['mypage', 'assignable-clubs'],
    queryFn: () => mypageApi.getAssignableClubs().then((res) => res.data.data.clubs),
    staleTime: MYPAGE_SUMMARY_STALE_TIME,
    gcTime: MYPAGE_SUMMARY_GC_TIME,
  });
}

export function useAssignableClubMap() {
  const query = useAssignableClubsQuery();

  const clubMap = useMemo(
    () =>
      new Map<string, MyPageAssignableClub>((query.data ?? []).map((club) => [club.clubId, club])),
    [query.data],
  );

  return {
    ...query,
    clubMap,
  };
}

export function useCurrentClubProfile(clubId: string): {
  summaryQuery: ReturnType<typeof useMyPageSummaryQuery>;
  currentProfile: MyPageCurrentProfile | null;
} {
  const summaryQuery = useMyPageSummaryQuery(clubId);

  return {
    summaryQuery,
    currentProfile: summaryQuery.data?.currentProfile ?? null,
  };
}

export function useMyPageQueries(clubId: string) {
  const summaryQuery = useMyPageSummaryQuery(clubId);
  const myClubsQuery = useMyClubsQuery();

  const me = summaryQuery.data?.user;
  const stats = summaryQuery.data?.stats;
  const usingProfiles = summaryQuery.data?.usingProfiles ?? [];
  const currentProfile = summaryQuery.data?.currentProfile ?? null;
  const baseClubs = myClubsQuery.data ?? [];

  const clubSummaryQueries = useQueries({
    queries: baseClubs.map((club) => ({
      queryKey: ['mypage', 'club-summary', club.id],
      queryFn: () => mypageApi.getMyClubMemberSummary(club.id).then((res) => res.data.data),
      enabled: baseClubs.length > 0,
      staleTime: MYPAGE_SUMMARY_STALE_TIME,
      gcTime: MYPAGE_SUMMARY_GC_TIME,
    })),
  });

  const clubs: ClubDto[] = baseClubs.map((club, index) => {
    const clubSummary = clubSummaryQueries[index]?.data;

    return {
      ...club,
      cardinals: clubSummary?.cardinals ?? [],
      memberRole: clubSummary?.role ?? club.memberRole,
    };
  });

  const activityClubs: MyPageActivityClub[] = clubs.map((club) => ({
    ...club,
    currentProfile:
      usingProfiles.find((profile) => profile.clubs.some((item) => item.clubId === club.id)) ??
      null,
  }));

  return {
    summaryQuery,
    myClubsQuery,
    me,
    stats,
    currentProfile,
    usingProfiles,
    clubs,
    activityClubs,
  };
}
