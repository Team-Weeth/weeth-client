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
  penalty: number;
  warning: number;
  status: MemberStatus;
}

export type MemberStatus = 'approved' | 'pending' | 'banned';
