import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminMemberApi } from '@/lib/apis';
import type { ClubMemberRole, Member } from '@/types/admin/member';
import { useClubId } from '@/stores';

const ROLE_LABEL: Record<ClubMemberRole, string> = {
  USER: '사용자',
  ADMIN: '관리자',
  LEAD: '리더',
};

// 멤버 권한 변경
export function useChangeMemberRole() {
  const queryClient = useQueryClient();
  const clubId = useClubId();
  const queryKey = ['admin', 'members', clubId];

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
      const previous = queryClient.getQueryData<Member[]>(queryKey);

      queryClient.setQueryData<Member[]>(queryKey, (old = []) =>
        old.map((m) =>
          m.clubMemberId === clubMemberId
            ? { ...m, memberRole, position: ROLE_LABEL[memberRole] }
            : m,
        ),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
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
  const queryKey = ['admin', 'members', clubId];

  return useMutation({
    mutationFn: (clubMemberId: number) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminMemberApi.banMember(clubId, clubMemberId);
    },
    onMutate: async (clubMemberId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Member[]>(queryKey);

      queryClient.setQueryData<Member[]>(queryKey, (old = []) =>
        old.map((m) => (m.clubMemberId === clubMemberId ? { ...m, status: 'BANNED' } : m)),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
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
  const queryKey = ['admin', 'members', clubId];

  return useMutation({
    mutationFn: (clubMemberId: number) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminMemberApi.restoreMember(clubId, clubMemberId);
    },
    onMutate: async (clubMemberId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Member[]>(queryKey);

      queryClient.setQueryData<Member[]>(queryKey, (old = []) =>
        old.map((m) => (m.clubMemberId === clubMemberId ? { ...m, status: 'ACTIVE' } : m)),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
