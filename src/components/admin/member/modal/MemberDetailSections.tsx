import type { ReactNode } from 'react';

import { AttendanceProgressBar } from '@/components/attendance';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui';
import { MemberStatusBadge } from '@/components/admin/member/MemberStatusBadge';
import { cn } from '@/lib/cn';
import type { Member } from '@/types/admin/member';
import { parseCardinals } from '@/utils/admin/parseCardinals';
import { compareCardinalDesc, formatCardinalLabel } from '@/utils/admin/memberTableUtils';

interface MemberDetailSummaryProps {
  member: Member;
  className?: string;
  avatarSize?: 128 | 100 | 64 | 40 | 36 | 24;
}

interface MemberDetailInfoCardProps {
  member: Member;
  className?: string;
}

interface InfoRowProps {
  label: string;
  value: ReactNode;
  alignValue?: 'right';
  labelClassName?: string;
  valueClassName?: string;
}

function MemberDetailSummary({ member, className, avatarSize = 64 }: MemberDetailSummaryProps) {
  const { latestCardinal } = getMemberDetailCardinals(member);

  return (
    <section className={cn('bg-container-neutral flex items-center gap-500 rounded-lg', className)}>
      <Avatar size={avatarSize}>
        {member.profileImageUrl && (
          <AvatarImage src={member.profileImageUrl} alt={`${member.name} 프로필 이미지`} />
        )}
        <AvatarFallback />
      </Avatar>

      <div className="flex min-w-0 flex-col gap-100">
        <div className="flex min-w-0 items-center gap-200">
          <span className="typo-sub1 text-text-normal truncate">{member.name}</span>
          {latestCardinal && (
            <MemberDetailCardinalTag active>
              {formatCardinalLabel(latestCardinal)}
            </MemberDetailCardinalTag>
          )}
        </div>
        <MemberStatusBadge status={member.status} variant="dot" />
        <p
          className={cn(
            'typo-body2 truncate',
            member.bio ? 'text-text-alternative' : 'text-text-disabled',
          )}
        >
          {member.bio ?? '-'}
        </p>
      </div>
    </section>
  );
}

function MemberPersonalInfoCard({ member, className }: MemberDetailInfoCardProps) {
  return (
    <section
      className={cn('border-line bg-container-neutral rounded-md border px-500 py-450', className)}
    >
      <p className="typo-body2 text-text-disabled mb-[14px]">회원 정보</p>

      <div className="flex flex-col gap-300">
        {getMemberPersonalInfo(member).map(({ label, value }) => (
          <InfoRow key={label} label={label} value={value} />
        ))}
      </div>
    </section>
  );
}

function MemberActivityInfoCard({ member, className }: MemberDetailInfoCardProps) {
  const { visibleCardinals, hiddenCardinals, hiddenCardinalCount } =
    getMemberDetailCardinals(member);

  return (
    <section
      className={cn('border-line bg-container-neutral rounded-md border px-500 py-450', className)}
    >
      <p className="typo-body2 text-text-disabled mb-[14px]">활동 정보</p>

      <div className="flex items-start gap-600">
        <span className="typo-button2 text-text-alternative w-16 shrink-0">활동기수</span>
        <div className="flex min-w-0 flex-wrap items-center gap-100">
          {visibleCardinals.map((cardinal) => (
            <MemberDetailCardinalTag key={cardinal}>
              {formatCardinalLabel(cardinal)}
            </MemberDetailCardinalTag>
          ))}
          {hiddenCardinalCount > 0 && (
            <MemberDetailCardinalTooltip
              content={hiddenCardinals.map(formatCardinalLabel).join(', ')}
            >
              +{hiddenCardinalCount}
            </MemberDetailCardinalTooltip>
          )}
        </div>
      </div>

      <div className="bg-line my-300 h-px w-full" />

      <div className="flex flex-col gap-300">
        {getMemberActivityStats(member).map(({ label, value }) => (
          <InfoRow key={label} label={label} value={value} alignValue="right" />
        ))}
        <div className="mt-100 flex flex-col gap-[6px]">
          <InfoRow
            label="출석률"
            value={`${member.attendanceRate}%`}
            alignValue="right"
            labelClassName="typo-caption2 text-text-alternative"
            valueClassName="typo-caption2 text-text-normal"
          />
          <AttendanceProgressBar
            attendanceRate={member.attendanceRate}
            showAbsenceRate={false}
            className="bg-container-neutral-alternative h-[6px] rounded-lg"
          />
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value, alignValue, labelClassName, valueClassName }: InfoRowProps) {
  return (
    <div className="flex items-start gap-600">
      <span className={cn(labelClassName ?? 'typo-button2 text-text-alternative', 'w-16 shrink-0')}>
        {label}
      </span>
      <span
        className={cn(
          valueClassName ?? 'typo-sub3 text-text-normal',
          alignValue === 'right' ? 'ml-auto text-right' : 'min-w-0 flex-1 break-keep',
        )}
      >
        {value ?? '-'}
      </span>
    </div>
  );
}

function MemberDetailCardinalTag({
  active = false,
  children,
}: {
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'typo-caption1 inline-flex h-6 items-center rounded-[5px] px-200',
        active ? 'bg-primary-500/10 text-brand-primary' : 'text-text-alternative bg-neutral-700/5',
      )}
    >
      {children}
    </span>
  );
}

function MemberDetailCardinalTooltip({
  children,
  content,
}: {
  children: ReactNode;
  content: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex cursor-default"
          aria-label={`숨겨진 활동기수 ${content}`}
        >
          <MemberDetailCardinalTag>{children}</MemberDetailCardinalTag>
        </button>
      </TooltipTrigger>
      <TooltipContent variant="dark" side="top" align="end">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

function getMemberPersonalInfo(member: Member) {
  return [
    { label: '역할', value: member.position },
    { label: '학과', value: member.department },
    { label: '학번', value: member.studentId },
    { label: '전화번호', value: member.phone },
    { label: '이메일', value: member.email },
    { label: '가입일', value: member.joinedAt },
  ];
}

function getMemberActivityStats(member: Member) {
  return [
    { label: '출석', value: member.attendance },
    { label: '결석', value: member.absence },
    { label: '패널티', value: member.penaltyCount },
  ];
}

function getMemberDetailCardinals(member: Member) {
  const cardinals = parseCardinals(member.cardinal).sort(compareCardinalDesc);
  const visibleCardinals = cardinals.slice(0, 4);
  const hiddenCardinals = cardinals.slice(4);

  return {
    cardinals,
    latestCardinal: cardinals[0],
    visibleCardinals,
    hiddenCardinals,
    hiddenCardinalCount: hiddenCardinals.length,
  };
}

export {
  MemberActivityInfoCard,
  MemberDetailCardinalTag,
  MemberDetailSummary,
  MemberPersonalInfoCard,
};
