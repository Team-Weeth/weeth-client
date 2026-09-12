import type { ClubMemberDetail, ClubMemberListItem, MemberProfile } from '@/types/member';

export function toMemberProfile(item: ClubMemberListItem): MemberProfile {
  return {
    id: item.clubMemberId,
    name: item.name,
    profileImageUrl: item.profileImageUrl,
    cardinals: item.cardinals,
    role: item.memberRole,
    description: item.bio ?? '',
  };
}

export function toMemberProfileFromDetail(item: ClubMemberDetail): MemberProfile {
  return {
    id: item.clubMemberId,
    name: item.name,
    profileImageUrl: item.profileImageUrl,
    coverImageUrl: item.headerImageUrl,
    cardinals: item.cardinals,
    role: item.memberRole,
    description: item.bio ?? '',
    phone: item.tel,
    email: item.email,
    studentId: item.studentId,
    department: item.department,
    postCount: item.postCount,
  };
}
