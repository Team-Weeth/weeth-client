export interface Member {
  id: string;
  name: string;
  role: string;
  department: string;
  generation: string;
  phone: string;
  studentId: string;
  position: string;
  attendance: number;
  absence: number;
  status: MemberStatus;
}

export type MemberStatus = 'approved' | 'pending' | 'banned';

export type MemberDetailStatus = 'approved' | 'pending' | 'banned';

export interface MemberDetail {
  name: string;
  generation: number;
  status: MemberDetailStatus;
  position: string;
  role: string;
  department: string;
  phone: string;
  studentId: string;
  email: string;
  activeGenerations: string;
  memberStatus: string;
  joinDate: string;
  attendance: number;
  absence: number;
}
