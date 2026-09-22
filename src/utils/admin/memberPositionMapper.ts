import type { MemberPositionColor } from '@/constants/admin/memberPosition';
import type {
  ClubPositionColor,
  ClubPositionOption,
  MemberPositionOption,
  SaveClubPositionOptionsBody,
} from '@/types/admin/memberPosition';

export function toPositionColorToken(color: ClubPositionColor): MemberPositionColor {
  return color.toLowerCase() as MemberPositionColor;
}

export function toPositionColorPreset(color: MemberPositionColor): ClubPositionColor {
  return color.toUpperCase() as ClubPositionColor;
}

export function toMemberPositionOption({
  id,
  name,
  color,
}: ClubPositionOption): MemberPositionOption {
  return { id: String(id), name, color: toPositionColorToken(color) };
}

/** 서버는 displayOrder로 순서를 주므로 그대로 정렬해 편집기 순서에 맞춘다. */
export function toMemberPositionOptions(options: ClubPositionOption[]): MemberPositionOption[] {
  return [...options].sort((a, b) => a.displayOrder - b.displayOrder).map(toMemberPositionOption);
}

/** 전체 교체 API라 편집기에 남아 있는 옵션 전부를 배치 순서대로 보낸다. */
export function toSavePositionOptionsBody(
  options: MemberPositionOption[],
): SaveClubPositionOptionsBody {
  return {
    options: options.map(({ name, color }) => ({ name, color: toPositionColorPreset(color) })),
  };
}
