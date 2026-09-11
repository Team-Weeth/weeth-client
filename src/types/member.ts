export type MemberRole = 'LEAD' | 'ADMIN' | 'USER';

export type MemberPosition = '프론트엔드' | '백엔드' | '디자인' | '기획';

export interface MemberProfile {
  id: number;
  name: string;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  cardinals: number[];
  role: MemberRole;
  position: MemberPosition;
  description: string;
  phone: string;
  email: string;
  department: string;
  studentId: string;
}

export interface MemberPost {
  postId: number;
  boardId: number;
  memberId: number;
  title: string;
  content: string;
  isNew: boolean;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  files: { id: number; fileName: string; fileUrl: string }[];
}
