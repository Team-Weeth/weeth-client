import Image from 'next/image';

import PositionIcon from '@/assets/icons/admin/ic_admin_position.svg';
import DepartmentIcon from '@/assets/icons/admin/ic_admin_department.svg';
import StudentNumberIcon from '@/assets/icons/admin/ic_admin_student_number.svg';
import TelIcon from '@/assets/icons/admin/ic_admin_tel.svg';
import CardinalIcon from '@/assets/icons/admin/ic_admin_cardinal.svg';
import { Tag } from '@/components/ui/tag';
import { cn } from '@/lib/cn';
import { PositionFieldIcon } from './PositionFieldIcon';

export const MEMBER_INFORMATION_FIELDS = [
  { label: '포지션', icon: PositionIcon, custom: true },
  { label: '학과', icon: DepartmentIcon, custom: false },
  { label: '학번', icon: StudentNumberIcon, custom: false },
  { label: '전화번호', icon: TelIcon, custom: false },
  { label: '기수', icon: CardinalIcon, custom: false },
];

interface MemberInformationFieldsProps {
  className?: string;
}

function MemberInformationFields({ className }: MemberInformationFieldsProps) {
  return (
    <ul aria-label="부원 기본 정보 필드" className={cn('flex flex-col gap-300', className)}>
      {MEMBER_INFORMATION_FIELDS.map(({ label, icon, custom }) => (
        <li
          key={label}
          className={cn(
            'bg-container-neutral flex items-center gap-4 rounded-sm px-500 py-400 shadow-sm dark:shadow-[0_1px_10px_0_rgba(0,0,0,0.40)]',
            !custom && 'opacity-50',
          )}
        >
          <span className="bg-container-neutral-alternative flex size-10 shrink-0 items-center justify-center rounded-sm">
            {custom ? <PositionFieldIcon /> : <Image src={icon} width={24} height={24} alt="" />}
          </span>
          <span className={cn('typo-sub1', custom ? 'text-text-strong' : 'text-text-alternative')}>
            {label}
          </span>
          {custom && (
            <Tag variant="caution" className="ml-auto">
              커스텀 필드
            </Tag>
          )}
        </li>
      ))}
    </ul>
  );
}

export { MemberInformationFields, type MemberInformationFieldsProps };
