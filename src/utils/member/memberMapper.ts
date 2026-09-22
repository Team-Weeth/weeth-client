import type { TagProps } from '@/components/ui/tag';
import type {
  ClubMemberDetail,
  ClubMemberListItem,
  ClubMemberPositionColor,
  MemberProfile,
} from '@/types/member';

const POSITION_TAG_VARIANT: Record<ClubMemberPositionColor, NonNullable<TagProps['variant']>> = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  PURPLE: 'purple',
  PINK: 'pink',
  CAUTION: 'caution',
  ERROR: 'error',
};

export function toPositionTagVariant(color: ClubMemberPositionColor) {
  return POSITION_TAG_VARIANT[color];
}

export function toMemberProfile(item: ClubMemberListItem): MemberProfile {
  return {
    id: item.clubMemberId,
    name: item.name,
    profileImageUrl: item.profileImageUrl,
    cardinals: item.cardinals,
    role: item.memberRole,
    position: item.position,
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
    position: item.position,
    description: item.bio ?? '',
    phone: item.tel,
    email: item.email,
    studentId: item.studentId,
    department: item.department,
    postCount: item.postCount,
  };
}
