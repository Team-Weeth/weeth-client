import Image from 'next/image';

import PositionIcon from '@/assets/icons/admin/ic_admin_position.svg';
import DepartmentIcon from '@/assets/icons/admin/ic_admin_department.svg';
import StudentNumberIcon from '@/assets/icons/admin/ic_admin_student_number.svg';
import TelIcon from '@/assets/icons/admin/ic_admin_tel.svg';
import CardinalIcon from '@/assets/icons/admin/ic_admin_cardinal.svg';
import { Icon } from '@/components/ui/Icon';
import { Tag } from '@/components/ui/tag';
import { cn } from '@/lib/cn';

export const MEMBER_POSITION_FIELDS = [
  { label: '포지션', icon: PositionIcon, custom: true },
  { label: '학과', icon: DepartmentIcon, custom: false },
  { label: '학번', icon: StudentNumberIcon, custom: false },
  { label: '전화번호', icon: TelIcon, custom: false },
  { label: '기수', icon: CardinalIcon, custom: false },
];

interface MemberPositionFieldsProps {
  className?: string;
}

function MemberPositionFields({ className }: MemberPositionFieldsProps) {
  return (
    <ul aria-label="부원 기본 정보 필드" className={cn('flex flex-col gap-300', className)}>
      {MEMBER_POSITION_FIELDS.map(({ label, icon, custom }) => (
        <li
          key={label}
          className={cn(
            'bg-container-neutral dark:shadow-dark flex items-center gap-4 rounded-sm px-500 py-400 shadow-sm',
            !custom && 'opacity-50',
          )}
        >
          <span className="bg-container-neutral-alternative flex size-10 shrink-0 items-center justify-center rounded-sm">
            {custom ? (
              <Icon src={icon} size={24} className="text-icon-normal" />
            ) : (
              <Image src={icon} width={24} height={24} alt="" />
            )}
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

export { MemberPositionFields, type MemberPositionFieldsProps };
