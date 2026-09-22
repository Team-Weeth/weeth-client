'use client';

import { useClubFeatures } from '@/providers/club-feature-provider';

import { CardinalTagList } from '@/components/admin/CardinalTagList';
import { SelectionCheckbox } from '@/components/admin/SelectionCheckbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/cn';
import { formatEmptyValue } from '@/utils/shared/formatEmptyValue';
import type { Member } from '@/types/admin/member';
import { MemberStatusBadge } from './MemberStatusBadge';

interface MemberCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onToggle'> {
  member: Member;
  selected: boolean;
  onToggleSelection: (id: string) => void;
  onMemberAction?: (member: Member) => void;
}

const MEMBER_CARD_STATS = [
  { id: 'attendance', label: '출석', getValue: (member: Member) => member.attendance },
  { id: 'absence', label: '결석', getValue: (member: Member) => member.absence },
  { id: 'penaltyCount', label: '페널티', getValue: (member: Member) => member.penaltyCount },
] as const;

function MemberCard({
  className,
  member,
  selected,
  onToggleSelection,
  onMemberAction,
  ...props
}: MemberCardProps) {
  const { warningEnabled } = useClubFeatures();
  return (
    <article
      className={cn(
        'flex flex-col rounded-[20px] border border-transparent bg-neutral-200 transition-colors',
        selected && 'border-brand-primary bg-container-primary-alternative',
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-[10px] px-[14px] pt-[14px] pb-300">
        <SelectionCheckbox
          checked={selected}
          className="p-0"
          ariaLabel={`${member.name} ${member.studentId} 선택`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection(member.id);
          }}
        />

        <button
          type="button"
          className="flex min-w-0 flex-1 cursor-pointer items-start gap-[10px] rounded-sm text-left"
          onClick={() => onMemberAction?.(member)}
        >
          <Avatar size={40}>
            {member.profileImageUrl && (
              <AvatarImage src={member.profileImageUrl} alt={`${member.name} 프로필 이미지`} />
            )}
            <AvatarFallback />
          </Avatar>

          <div className="min-w-0 flex-1 pt-[6px]">
            <p className="typo-sub3 text-text-strong truncate">{member.name}</p>
            <p className="typo-caption2 text-text-alternative truncate">
              {formatEmptyValue(member.position)}
            </p>
          </div>

          <MemberStatusBadge
            status={member.status}
            variant="dot"
            className="typo-sub3 shrink-0 pt-[7px]"
          />
        </button>
      </div>

      <dl className={cn('grid px-[14px] py-400', warningEnabled ? 'grid-cols-4' : 'grid-cols-3')}>
        {MEMBER_CARD_STATS.map((stat, index) => (
          <MemberCardStat
            key={stat.id}
            label={stat.label}
            value={stat.getValue(member)}
            showDivider={index > 0}
          />
        ))}
        {warningEnabled && (
          <MemberCardStat label="경고" value={member.warningCount ?? '-'} showDivider />
        )}
      </dl>

      <div className="flex min-w-0 items-end justify-between gap-300 px-[14px] pt-[14px] pb-300">
        <div className="typo-caption2 text-text-alternative min-w-0">
          <p className="truncate">{formatEmptyValue(member.department)}</p>
          <p className="truncate">{formatEmptyValue(member.studentId)}</p>
        </div>

        <CardinalTagList
          cardinal={member.cardinal}
          size="sm"
          className="max-w-[45%] shrink-0 justify-end"
        />
      </div>
    </article>
  );
}

function MemberCardStat({
  label,
  value,
  showDivider,
}: {
  label: string;
  value: number | string;
  showDivider: boolean;
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center gap-[2px]',
        showDivider && 'border-line border-l',
      )}
    >
      <dt className="typo-caption2 text-text-disabled order-2">{label}</dt>
      <dd className="typo-sub1 text-text-strong order-1">{value}</dd>
    </div>
  );
}

export { MemberCard, type MemberCardProps };
