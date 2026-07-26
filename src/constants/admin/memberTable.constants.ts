export const MEMBER_TABLE_COLUMNS = [
  { id: 'profile', label: '이름/자기소개', width: 'w-[172px]' },
  { id: 'role', label: '역할', width: 'w-[118px]' },
  { id: 'department', label: '학과', width: 'w-[190px]' },
  { id: 'studentId', label: '학번', width: 'w-[138px]' },
  { id: 'attendance', label: '출석', width: 'w-12', align: 'text-center' },
  { id: 'absence', label: '결석', width: 'w-12', align: 'text-center' },
  { id: 'penalty', label: '패널티', width: 'w-12', align: 'text-center' },
  { id: 'warning', label: '경고', width: 'w-12', align: 'text-center' },
  { id: 'position', label: '직급', width: 'w-[98px]' },
  { id: 'phone', label: '전화번호', width: 'w-[146px]' },
  { id: 'cardinal', label: '기수', width: 'w-[182px]' },
] as const;
