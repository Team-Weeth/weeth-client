import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminMemberApi } from '@/lib/apis/adminMember';
import { revalidateDashboard } from '@/lib/actions/club';
import type { ClubMemberRole, Member } from '@/types/admin/member';
import type { PageResponse } from '@/types/common';
import { useClubId } from '@/stores';
import { useUserStore } from '@/stores/useUserStore';
import { ROLE_MAP } from '@/utils/admin/memberMapper';
import { adminQueryKeys } from '@/hooks/queries/admin/adminQueryKeys';

type MemberPageCache = PageResponse<Member>;

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
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueriesData<MemberPageCache>({ queryKey });

      queryClient.setQueriesData<MemberPageCache>({ queryKey }, (old) =>
        updateMemberPage(old, (m) =>
          m.clubMemberId === clubMemberId
            ? { ...m, memberRole, position: ROLE_MAP[memberRole] }
            : m,
        ),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
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
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueriesData<MemberPageCache>({ queryKey });

      queryClient.setQueriesData<MemberPageCache>({ queryKey }, (old) =>
        updateMemberPage(old, (m) =>
          m.clubMemberId === clubMemberId ? { ...m, status: 'BANNED' } : m,
        ),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
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
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueriesData<MemberPageCache>({ queryKey });
      const nextCardinal = [...cardinalIds].sort((a, b) => a - b).join(', ');

      queryClient.setQueriesData<MemberPageCache>({ queryKey }, (old) =>
        updateMemberPage(old, (m) =>
          m.clubMemberId === clubMemberId ? { ...m, cardinal: nextCardinal } : m,
        ),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
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
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueriesData<MemberPageCache>({ queryKey });

      queryClient.setQueriesData<MemberPageCache>({ queryKey }, (old) =>
        updateMemberPage(old, (m) =>
          m.clubMemberId === clubMemberId ? { ...m, status: 'ACTIVE' } : m,
        ),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

function updateMemberPage(
  page: MemberPageCache | undefined,
  updateMember: (member: Member) => Member,
) {
  if (!page) return page;

  return {
    ...page,
    content: page.content.map(updateMember),
  };
}
