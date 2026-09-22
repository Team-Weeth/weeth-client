import type { MemberPositionColor } from '@/constants/admin/memberPosition';
import type {
  ClubPositionColor,
  ClubPositionOption,
  MemberPositionOption,
  MemberPositionSavePayload,
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

/** 남아 있는 옵션은 배치 순서대로, 지운 옵션은 id로 따로 보낸다. */
export function toSavePositionOptionsBody({
  options,
  deletedIds,
}: MemberPositionSavePayload): SaveClubPositionOptionsBody {
  return {
    options: options.map(({ id, name, color }) => ({
      id,
      name,
      color: toPositionColorPreset(color),
    })),
    deletedPositionIds: deletedIds,
  };
}
