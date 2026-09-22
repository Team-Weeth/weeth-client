import type { MemberPositionColor } from '@/constants/admin/memberPosition';

export interface MemberPositionOption {
  id: string;
  name: string;
  color: MemberPositionColor;
}

/** 서버 색상 프리셋. 색상 토큰명과 대소문자만 다르다. */
export type ClubPositionColor = Uppercase<MemberPositionColor>;

/** GET /admin/clubs/{clubId}/positions 응답 항목 */
export interface ClubPositionOption {
  id: number;
  name: string;
  color: ClubPositionColor;
  displayOrder: number;
}

/**
 * PUT /admin/clubs/{clubId}/positions 요청 본문.
 * options는 추가/수정할 목록(id가 null이면 신규 생성, 배열 순서가 표시 순서)이고,
 * 삭제는 deletedPositionIds로 따로 알려야 한다. options에서 빠뜨리는 것만으로는 지워지지 않는다.
 */
export interface SaveClubPositionOptionsBody {
  options: { id: number | null; name: string; color: ClubPositionColor }[];
  deletedPositionIds: number[];
}

/**
 * 편집기가 저장할 때 넘기는 값.
 * id가 null이면 새로 만드는 옵션이고, deletedIds는 서버에 있던 옵션 중 편집기에서 지운 것들이다.
 */
export interface MemberPositionSavePayload {
  options: { id: number | null; name: string; color: MemberPositionColor }[];
  deletedIds: number[];
}

export interface MemberPositionEditorOptions {
  /** 최초 편집값. 다른 동아리로 전환할 때는 부모에서 key를 변경한다. */
  initialOptions?: MemberPositionOption[];
  onSave: (payload: MemberPositionSavePayload) => void | Promise<void>;
}
