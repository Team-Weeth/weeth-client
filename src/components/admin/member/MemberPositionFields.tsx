import Image from 'next/image';

import PositionIcon from '@/assets/icons/admin/ic_admin_position.svg';
import PositionDarkIcon from '@/assets/icons/admin/ic_admin_position_dark.svg';
import DepartmentIcon from '@/assets/icons/admin/ic_admin_department.svg';
import StudentNumberIcon from '@/assets/icons/admin/ic_admin_student_number.svg';
import TelIcon from '@/assets/icons/admin/ic_admin_tel.svg';
import CardinalIcon from '@/assets/icons/admin/ic_admin_cardinal.svg';
import { Tag } from '@/components/ui/tag';
import { cn } from '@/lib/cn';

import type { StaticImageData } from 'next/image';

interface MemberPositionField {
  label: string;
  icon: StaticImageData;
  /** 다크모드 전용 아이콘. 없으면 라이트 아이콘을 그대로 쓴다. */
  darkIcon?: StaticImageData;
  custom: boolean;
}

export const MEMBER_POSITION_FIELDS: MemberPositionField[] = [
  { label: '포지션', icon: PositionIcon, darkIcon: PositionDarkIcon, custom: true },
  { label: '학과', icon: DepartmentIcon, custom: false },
  { label: '학번', icon: StudentNumberIcon, custom: false },
  { label: '전화번호', icon: TelIcon, custom: false },
  { label: '기수', icon: CardinalIcon, custom: false },
];

/**
 * 민트 포인트가 들어간 2색 아이콘이라 `Icon`(CSS 마스크)으로 칠할 수 없다.
 * 다크 아이콘이 따로 있으면 두 장을 겹쳐두고 CSS로만 전환한다.
 */
function MemberPositionFieldIcon({
  icon,
  darkIcon,
}: Pick<MemberPositionField, 'icon' | 'darkIcon'>) {
  return (
    <span className="bg-container-neutral-alternative flex size-10 shrink-0 items-center justify-center rounded-sm">
      <Image src={icon} width={24} height={24} alt="" className={cn(darkIcon && 'dark:hidden')} />
      {darkIcon && (
        <Image src={darkIcon} width={24} height={24} alt="" className="hidden dark:block" />
      )}
    </span>
  );
}

interface MemberPositionFieldsProps {
  className?: string;
}

function MemberPositionFields({ className }: MemberPositionFieldsProps) {
  return (
    <ul aria-label="부원 기본 정보 필드" className={cn('flex flex-col gap-300', className)}>
      {MEMBER_POSITION_FIELDS.map(({ label, icon, darkIcon, custom }) => (
        <li
          key={label}
          className={cn(
            'bg-container-neutral dark:shadow-dark flex items-center gap-4 rounded-sm px-500 py-400 shadow-sm',
            custom ? 'cursor-pointer' : 'opacity-50',
          )}
        >
          <MemberPositionFieldIcon icon={icon} darkIcon={darkIcon} />
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

export {
  MemberPositionFields,
  MemberPositionFieldIcon,
  type MemberPositionFieldsProps,
  type MemberPositionField,
};
