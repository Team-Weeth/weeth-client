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

/** PUT /admin/clubs/{clubId}/positions 요청 본문 (전체 교체, 배열 순서가 표시 순서) */
export interface SaveClubPositionOptionsBody {
  options: { name: string; color: ClubPositionColor }[];
}

export interface MemberPositionEditorOptions {
  /** 최초 편집값. 다른 동아리로 전환할 때는 부모에서 key를 변경한다. */
  initialOptions?: MemberPositionOption[];
  onSave: (options: MemberPositionOption[]) => void | Promise<void>;
}
