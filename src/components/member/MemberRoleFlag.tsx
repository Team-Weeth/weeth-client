import Image from 'next/image';
import FlagCautionIcon from '@/assets/icons/flag_caution.svg';
import FlagSecondaryIcon from '@/assets/icons/flag_secondary.svg';
import type { MemberRole } from '@/types/member';

const FLAG_CONFIG: Partial<
  Record<MemberRole, { icon: typeof FlagSecondaryIcon; label: string; width: number }>
> = {
  LEAD: { icon: FlagSecondaryIcon, label: '리더', width: 46 },
  ADMIN: { icon: FlagCautionIcon, label: '운영진', width: 56 },
};

interface MemberRoleFlagProps {
  role: MemberRole;
}

function MemberRoleFlag({ role }: MemberRoleFlagProps) {
  const config = FLAG_CONFIG[role];
  if (!config) return null;

  return (
    <div className="absolute top-[16px] left-0">
      <Image src={config.icon} alt="" width={config.width} height={32} />
      <span className="typo-caption1 text-text-inverse absolute inset-0 flex items-center pl-[9px]">
        {config.label}
      </span>
    </div>
  );
}

export { MemberRoleFlag, type MemberRoleFlagProps };
