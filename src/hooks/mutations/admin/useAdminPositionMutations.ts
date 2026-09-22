import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';

import { adminQueryKeys } from '@/hooks/queries/admin/adminQueryKeys';
import { mypageQueryKeys } from '@/hooks/queries/mypage/mypageQueryKeys';
import { adminPositionApi } from '@/lib/apis/adminPosition';
import { useClubId } from '@/stores';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import type { Member } from '@/types/admin/member';
import type { MemberPositionOption, MemberPositionSavePayload } from '@/types/admin/memberPosition';
import type { PageResponse } from '@/types/common';
import { toSavePositionOptionsBody } from '@/utils/admin/memberPositionMapper';

/** 포지션 옵션 저장(PUT). 저장 후 새 옵션에 서버 id가 붙으므로 목록을 다시 받아온다. */
export function useSavePositionOptions() {
  const queryClient = useQueryClient();
  const clubId = useClubId();

  return useMutation({
    mutationFn: (payload: MemberPositionSavePayload) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminPositionApi.saveOptions(clubId, toSavePositionOptionsBody(payload));
    },
    onSuccess: () => {
      // 멤버 표의 포지션 태그도 삭제/이름 변경을 반영해야 한다.
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.members(clubId) });
      // 내 포지션 옵션의 이름·색이 바뀌었을 수 있어 마이페이지 프로필도 다시 받아온다.
      queryClient.invalidateQueries({ queryKey: mypageQueryKeys.summary(clubId) });
      // 편집기가 새 옵션의 서버 id를 받아야 다음 저장에서 중복 생성되지 않는다.
      // Promise를 돌려줘 재조회가 끝난 뒤에 저장이 완료되게 한다.
      return queryClient.invalidateQueries({ queryKey: adminQueryKeys.positions(clubId) });
    },
  });
}

/** 드롭다운에서 고르면 즉시 저장하는 단건 지정/해제. option이 null이면 해제한다. */
export function useUpdateMemberPosition() {
  const queryClient = useQueryClient();
  const clubId = useClubId();

  return useMutation({
    mutationFn: ({
      clubMemberId,
      option,
    }: {
      clubMemberId: number;
      option: MemberPositionOption | null;
    }) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminPositionApi.updateMemberPosition(clubId, clubMemberId, toOptionId(option));
    },
    onMutate: ({ clubMemberId, option }) =>
      applyOptimisticPosition(queryClient, clubId, [clubMemberId], option),
    onSuccess: (_data, { option }) => {
      toastSuccess(option ? '포지션이 변경되었습니다.' : '포지션이 해제되었습니다.');
    },
    onError: (_error, _variables, context) => {
      restoreMemberCaches(queryClient, context);
      toastError('포지션 변경에 실패했습니다.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.members(clubId) });
      // 바꾼 대상이 본인일 수 있어 마이페이지 프로필의 포지션 태그도 다시 받아온다.
      queryClient.invalidateQueries({ queryKey: mypageQueryKeys.summary(clubId) });
    },
  });
}

/** 선택한 멤버 전원을 같은 포지션으로 일괄 지정/해제. option이 null이면 해제한다. */
export function useUpdateMemberPositions() {
  const queryClient = useQueryClient();
  const clubId = useClubId();

  return useMutation({
    mutationFn: ({
      clubMemberIds,
      option,
    }: {
      clubMemberIds: number[];
      option: MemberPositionOption | null;
    }) => {
      if (!clubId) throw new Error('clubId가 없습니다');
      return adminPositionApi.updateMemberPositions(clubId, clubMemberIds, toOptionId(option));
    },
    onMutate: ({ clubMemberIds, option }) =>
      applyOptimisticPosition(queryClient, clubId, clubMemberIds, option),
    onSuccess: (_data, { clubMemberIds, option }) => {
      const target = `${clubMemberIds.length}명의 포지션이`;
      toastSuccess(option ? `${target} 변경되었습니다.` : `${target} 해제되었습니다.`);
    },
    onError: (_error, _variables, context) => {
      restoreMemberCaches(queryClient, context);
      toastError('포지션 일괄 변경에 실패했습니다.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.members(clubId) });
      // 바꾼 대상이 본인일 수 있어 마이페이지 프로필의 포지션 태그도 다시 받아온다.
      queryClient.invalidateQueries({ queryKey: mypageQueryKeys.summary(clubId) });
    },
  });
}

function toOptionId(option: MemberPositionOption | null) {
  return option ? Number(option.id) : null;
}

/** 멤버 쿼리 키 하나로 목록(페이지), 무한 스크롤, 검색 결과 캐시가 모두 걸린다. */
type MemberCache = Member[] | PageResponse<Member> | InfiniteData<PageResponse<Member>>;

function mapMemberCache(
  cache: MemberCache | undefined,
  updateMember: (member: Member) => Member,
): MemberCache | undefined {
  if (!cache) return cache;
  if (Array.isArray(cache)) return cache.map(updateMember);
  if ('pages' in cache) {
    return {
      ...cache,
      pages: cache.pages.map((page) => ({ ...page, content: page.content.map(updateMember) })),
    };
  }
  return { ...cache, content: cache.content.map(updateMember) };
}

async function applyOptimisticPosition(
  queryClient: QueryClient,
  clubId: string | null,
  clubMemberIds: number[],
  option: MemberPositionOption | null,
) {
  const filters = { queryKey: adminQueryKeys.members(clubId) };
  const targets = new Set(clubMemberIds);

  await queryClient.cancelQueries(filters);
  const previous = queryClient.getQueriesData<MemberCache>(filters);

  queryClient.setQueriesData<MemberCache>(filters, (cache) =>
    mapMemberCache(cache, (member) =>
      targets.has(member.clubMemberId) ? { ...member, positionOption: option } : member,
    ),
  );

  return previous;
}

function restoreMemberCaches(
  queryClient: QueryClient,
  previous: [readonly unknown[], MemberCache | undefined][] | undefined,
) {
  previous?.forEach(([key, cache]) => queryClient.setQueryData(key, cache));
}
