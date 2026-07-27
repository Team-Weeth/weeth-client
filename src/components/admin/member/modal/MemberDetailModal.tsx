'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  Avatar,
  AvatarFallback,
  Button,
  Icon,
} from '@/components/ui';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { AttendanceProgressBar } from '@/components/attendance';
import { MemberStatusBadge } from '@/components/admin/member/MemberStatusBadge';
import { AdminCloseIcon } from '@/assets/icons/admin';
import { getFooterActions } from '@/constants/admin/memberDetailModal.constants';
import { parseCardinals } from '@/utils/admin/parseCardinals';
import type { ClubMemberRole, Member } from '@/types/admin/member';

interface MemberDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onChangeRole?: () => void;
  onBan?: () => void;
  onRestore?: () => void;
  onChangeCardinals?: () => void;
  onTransferLead?: () => void;
}

function MemberDetailModal({
  open,
  onOpenChange,
  member,
  onChangeRole,
  onBan,
  onRestore,
  onChangeCardinals,
  onTransferLead,
}: MemberDetailModalProps) {
  if (!member) return null;

  const handleClose = () => onOpenChange(false);

  const personalInfo = getModalPersonalInfo(member);
  const activityStats = getModalActivityStats(member);
  const cardinals = parseCardinals(member.cardinal).sort(compareCardinalDesc);
  const latestCardinal = cardinals[0];
  const visibleCardinals = cardinals.slice(0, 4);
  const hiddenCardinals = cardinals.slice(4);
  const hiddenCardinalCount = hiddenCardinals.length;
  const footerActions = getFooterActions({
    memberRole: member.memberRole,
    status: member.status,
    onChangeRole,
    onBan,
    onRestore,
    onTransferLead,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-background flex w-215 max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-lg p-0"
        showCloseButton={false}
      >
        <div className="flex items-center justify-between px-700 pt-700 pb-500">
          <DialogTitle className="typo-h3 text-text-strong">멤버 상세</DialogTitle>
          <button
            type="button"
            onClick={handleClose}
            className="flex cursor-pointer items-center justify-center rounded-sm p-200"
            aria-label="닫기"
          >
            <Icon src={AdminCloseIcon} size={24} alt="닫기버튼" />
          </button>
        </div>

        <div className="flex flex-col gap-500 overflow-y-auto px-700 pt-200 pb-600">
          <section className="bg-container-neutral flex items-center gap-500 rounded-lg px-500 py-[18px]">
            <Avatar size={64}>
              <AvatarFallback />
            </Avatar>

            <div className="flex min-w-0 flex-col gap-100">
              <div className="flex items-center gap-200">
                <span className="typo-sub1 text-text-normal truncate">{member.name}</span>
                {latestCardinal && (
                  <ModalCardinalTag active>{formatCardinalLabel(latestCardinal)}</ModalCardinalTag>
                )}
              </div>
              <MemberStatusBadge status={member.status} variant="dot" />
              <p className="typo-body2 text-text-alternative truncate">-</p>
            </div>
          </section>

          <div className="tablet:grid-cols-2 grid grid-cols-1 gap-500">
            <section className="border-line bg-container-neutral rounded-md border px-500 py-[18px]">
              <p className="typo-body2 text-text-disabled mb-[14px]">회원 정보</p>

              <div className="flex flex-col gap-[14px]">
                {personalInfo.map(({ label, value }) => (
                  <InfoRow key={label} label={label} value={value} />
                ))}
              </div>
            </section>

            <section className="border-line bg-container-neutral rounded-md border px-500 py-[18px]">
              <p className="typo-body2 text-text-disabled mb-[14px]">활동 정보</p>

              <div className="flex items-start gap-600">
                <span className="typo-button2 text-text-alternative w-16 shrink-0">활동기수</span>
                <div className="flex min-w-0 flex-wrap items-center gap-100">
                  {visibleCardinals.map((cardinal) => (
                    <ModalCardinalTag key={cardinal}>
                      {formatCardinalLabel(cardinal)}
                    </ModalCardinalTag>
                  ))}
                  {hiddenCardinalCount > 0 && (
                    <ModalCardinalTooltip
                      content={hiddenCardinals.map(formatCardinalLabel).join(', ')}
                    >
                      +{hiddenCardinalCount}
                    </ModalCardinalTooltip>
                  )}
                </div>
              </div>

              <div className="bg-line my-300 h-px w-full" />

              <div className="flex flex-col gap-300">
                {activityStats.map(({ label, value }) => (
                  <InfoRow key={label} label={label} value={value} alignValue="right" />
                ))}
                <div className="mt-100 flex flex-col gap-100">
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
          </div>
        </div>

        <div className="bg-container-neutral flex flex-wrap items-center justify-between gap-200 px-700 py-500">
          <div className="flex flex-wrap items-center gap-200">
            {footerActions.map(({ label, title, description, handler }) => (
              <AlertDialog
                key={label}
                title={title}
                description={description}
                trigger={
                  <Button variant="secondary" size="md" className="rounded-sm">
                    {label}
                  </Button>
                }
              >
                <AlertDialogAction onClick={handler}>확인</AlertDialogAction>
                <AlertDialogCancel>취소</AlertDialogCancel>
              </AlertDialog>
            ))}
            {onChangeCardinals && (
              <Button
                variant="secondary"
                size="md"
                className="rounded-sm"
                onClick={onChangeCardinals}
              >
                기수 변경
              </Button>
            )}
          </div>

          <Button variant="primary" size="md" className="rounded-sm" onClick={handleClose}>
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const MEMBER_ROLE_LABEL: Record<ClubMemberRole, string> = {
  USER: '사용자',
  ADMIN: '관리자',
  LEAD: '리더',
};

function getModalPersonalInfo(member: Member) {
  return [
    { label: '직급', value: MEMBER_ROLE_LABEL[member.memberRole] },
    { label: '역할', value: member.position },
    { label: '학과', value: member.department },
    { label: '학번', value: member.studentId },
    { label: '전화번호', value: member.phone },
    { label: '이메일', value: member.email },
    { label: '가입일', value: '-' },
  ];
}

function getModalActivityStats(member: Member) {
  return [
    { label: '출석', value: member.attendance },
    { label: '결석', value: member.absence },
    { label: '패널티', value: member.penaltyCount },
    { label: '경고', value: 0 },
  ];
}

function compareCardinalDesc(a: string, b: string) {
  return getCardinalNumber(b) - getCardinalNumber(a);
}

function getCardinalNumber(cardinal: string) {
  return Number(cardinal.replace('기', '')) || 0;
}

function formatCardinalLabel(cardinal: string) {
  return cardinal.endsWith('기') ? cardinal : `${cardinal}기`;
}

function ModalCardinalTag({
  active = false,
  children,
}: {
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={
        active
          ? 'bg-container-primary-alternative text-brand-primary inline-flex h-6 items-center rounded-[5px] px-200 text-[13px] leading-[18px] font-semibold tracking-[var(--letter-spacing)]'
          : 'bg-container-neutral-alternative text-text-alternative inline-flex h-6 items-center rounded-[5px] px-200 text-[13px] leading-[18px] font-semibold tracking-[var(--letter-spacing)]'
      }
    >
      {children}
    </span>
  );
}

function ModalCardinalTooltip({
  children,
  content,
}: {
  children: React.ReactNode;
  content: string;
}) {
  return (
    <button
      type="button"
      className="group relative inline-flex cursor-default"
      aria-label={`숨겨진 활동기수 ${content}`}
    >
      <ModalCardinalTag>{children}</ModalCardinalTag>
      <span className="bg-container-primary-interaction text-text-inverse typo-body2 pointer-events-none absolute right-0 bottom-[calc(100%+8px)] z-50 w-max rounded-sm p-200 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
        {content}
      </span>
    </button>
  );
}

function InfoRow({
  label,
  value,
  alignValue,
  labelClassName,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  alignValue?: 'right';
  labelClassName?: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start gap-600">
      <span
        className={[labelClassName ?? 'typo-button2 text-text-alternative', 'w-16 shrink-0'].join(
          ' ',
        )}
      >
        {label}
      </span>
      <span
        className={[
          valueClassName ?? 'typo-sub3 text-text-normal',
          alignValue === 'right' ? 'ml-auto text-right' : 'min-w-0 flex-1 break-keep',
        ].join(' ')}
      >
        {value ?? '-'}
      </span>
    </div>
  );
}

export { MemberDetailModal, type MemberDetailModalProps };
