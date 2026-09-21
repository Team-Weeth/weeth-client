import type { MemberPositionColor } from '@/constants/admin/memberPosition';

export interface MemberPositionOption {
  id: string;
  name: string;
  color: MemberPositionColor;
}

export interface MemberPositionEditorOptions {
  /** 최초 편집값. 다른 동아리로 전환할 때는 부모에서 key를 변경한다. */
  initialOptions?: MemberPositionOption[];
  onSave: (options: MemberPositionOption[]) => void | Promise<void>;
}
