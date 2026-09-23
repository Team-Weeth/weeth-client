import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';

import { adminMemberApi } from '@/lib/apis/adminMember';
import { revalidateDashboard } from '@/lib/actions/club';
import type { ClubMemberRole, Member } from '@/types/admin/member';
import type { PageResponse } from '@/types/common';
import { useClubId } from '@/stores';
import { useUserStore } from '@/stores/useUserStore';
import { ROLE_MAP } from '@/utils/admin/memberMapper';
import { adminQueryKeys } from '@/hooks/queries/admin/adminQueryKeys';

type MemberPageCache = PageResponse<Member>;
type MemberInfinitePageCache = InfiniteData<MemberPageCache>;
// 검색 결과는 같은 members prefix에 Member[] 형태로 캐시
type MemberListCache = MemberPageCache | Member[];

function getMemberPageQueryFilters(queryKey: readonly unknown[]) {
  return {
    queryKey,
    predicate: (query: { queryKey: readonly unknown[] }) => !query.queryKey.includes('infinite'),
  };
}

function getMemberInfinitePageQueryFilters(queryKey: readonly unknown[]) {
  return {
    queryKey,
    predicate: (query: { queryKey: readonly unknown[] }) => query.queryKey.includes('infinite'),
  };
}

async function updateMemberCaches(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  updateMember: (member: Member) => Member,
) {
  const memberPageQueryFilters = getMemberPageQueryFilters(queryKey);
  const memberInfinitePageQueryFilters = getMemberInfinitePageQueryFilters(queryKey);

  await Promise.all([
    queryClient.cancelQueries(memberPageQueryFilters),
    queryClient.cancelQueries(memberInfinitePageQueryFilters),
  ]);

  const previousPages = queryClient.getQueriesData<MemberListCache>(memberPageQueryFilters);
  const previousInfinitePages = queryClient.getQueriesData<MemberInfinitePageCache>(
    memberInfinitePageQueryFilters,
  );

  queryClient.setQueriesData<MemberListCache>(memberPageQueryFilters, (old) =>
    updateMemberPage(old, updateMember),
  );
  queryClient.setQueriesData<MemberInfinitePageCache>(memberInfinitePageQueryFilters, (old) =>
    updateMemberInfinitePage(old, updateMember),
  );

  return { previousPages, previousInfinitePages };
}

function restoreMemberCaches(
  queryClient: QueryClient,
  context: Awaited<ReturnType<typeof updateMemberCaches>> | undefined,
) {
  context?.previousPages.forEach(([key, data]) => queryClient.setQueryData(key, data));
  context?.previousInfinitePages.forEach(([key, data]) => queryClient.setQueryData(key, data));
}

// 멤버 권한 변경
export function useChangeMemberRole() {
  const queryClient = useQueryClient();
  const clubId = useClubId();
  const queryKey = adminQueryKeys.members(clubId);

  return useMutation({
    mutationFn: ({
      clubMemberId,
      memberRole,
    }: {
      clubMemberId: number;
      memberRole: ClubMemberRole;
    }) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminMemberApi.updateMemberRole(clubId, clubMemberId, memberRole);
    },
    onMutate: async ({ clubMemberId, memberRole }) => {
      return updateMemberCaches(queryClient, queryKey, (m) =>
        m.clubMemberId === clubMemberId ? { ...m, memberRole, position: ROLE_MAP[memberRole] } : m,
      );
    },
    onError: (_err, _vars, context) => {
      restoreMemberCaches(queryClient, context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

// 멤버 추방
export function useBanMember() {
  const queryClient = useQueryClient();
  const clubId = useClubId();
  const queryKey = adminQueryKeys.members(clubId);

  return useMutation({
    mutationFn: (clubMemberId: number) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminMemberApi.banMember(clubId, clubMemberId);
    },
    onMutate: async (clubMemberId) => {
      return updateMemberCaches(queryClient, queryKey, (m) =>
        m.clubMemberId === clubMemberId ? { ...m, status: 'BANNED' } : m,
      );
    },
    onError: (_err, _vars, context) => {
      restoreMemberCaches(queryClient, context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

// 멤버 기수 수정
export function useChangeMemberCardinals() {
  const queryClient = useQueryClient();
  const clubId = useClubId();
  const queryKey = adminQueryKeys.members(clubId);

  return useMutation({
    mutationFn: ({
      clubMemberId,
      cardinalIds,
      force,
    }: {
      clubMemberId: number;
      cardinalIds: number[];
      force?: boolean;
    }) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminMemberApi.updateMemberCardinals(clubId, clubMemberId, { cardinalIds, force });
    },
    onMutate: async ({ clubMemberId, cardinalIds }) => {
      const nextCardinal = [...cardinalIds].sort((a, b) => a - b).join(', ');

      return updateMemberCaches(queryClient, queryKey, (m) =>
        m.clubMemberId === clubMemberId ? { ...m, cardinal: nextCardinal } : m,
      );
    },
    onError: (_err, _vars, context) => {
      restoreMemberCaches(queryClient, context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

// LEAD 권한 이양
export function useTransferLead() {
  const queryClient = useQueryClient();
  const clubId = useClubId();
  const queryKey = adminQueryKeys.members(clubId);

  return useMutation({
    mutationFn: (clubMemberId: number) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminMemberApi.transferLead(clubId, clubMemberId);
    },
    onSuccess: async () => {
      useUserStore.getState().setRole('ADMIN');
      if (clubId) await revalidateDashboard(clubId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

// 추방 유저 복구
export function useRestoreMember() {
  const queryClient = useQueryClient();
  const clubId = useClubId();
  const queryKey = adminQueryKeys.members(clubId);

  return useMutation({
    mutationFn: (clubMemberId: number) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminMemberApi.restoreMember(clubId, clubMemberId);
    },
    onMutate: async (clubMemberId) => {
      return updateMemberCaches(queryClient, queryKey, (m) =>
        m.clubMemberId === clubMemberId ? { ...m, status: 'ACTIVE' } : m,
      );
    },
    onError: (_err, _vars, context) => {
      restoreMemberCaches(queryClient, context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

function updateMemberPage(
  page: MemberListCache | undefined,
  updateMember: (member: Member) => Member,
): MemberListCache | undefined {
  if (!page) return page;

  // 검색 결과 캐시는 PageResponse가 아니라 Member[]이므로 content가 없음
  if (Array.isArray(page)) return page.map(updateMember);

  return {
    ...page,
    content: page.content.map(updateMember),
  };
}

function updateMemberInfinitePage(
  data: MemberInfinitePageCache | undefined,
  updateMember: (member: Member) => Member,
) {
  if (!data) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      content: page.content.map(updateMember),
    })),
  };
}
