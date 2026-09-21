'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BackIcon from '@/assets/icons/back.svg';
import ArrowDownIcon from '@/assets/icons/arrow_down.svg';
import PositionIcon from '@/assets/icons/admin/ic_admin_position.svg';
import { Icon } from '@/components/ui/Icon';
import { Tag } from '@/components/ui/tag';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/cn';
import { MEMBER_POSITION_FIELDS } from './MemberPositionFields';
import { MemberPositionEditor, type MemberPositionEditorProps } from './MemberPositionEditor';

function MemberPositionMobile({ className, ...editorProps }: MemberPositionEditorProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        'bg-container-neutral flex min-h-full min-w-0 flex-col gap-700 px-400 pt-400 pb-700',
        className,
      )}
    >
      <div className="flex items-center gap-100">
        <button
          type="button"
          aria-label="뒤로가기"
          className="text-icon-normal flex size-6 shrink-0 cursor-pointer items-center justify-center"
          onClick={() => router.back()}
        >
          <Icon src={BackIcon} size={16} />
        </button>
        <h1 className="typo-sub1 text-text-normal">부원 정보</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="group bg-container-neutral dark:shadow-dark flex w-full cursor-pointer items-center gap-400 rounded-sm px-500 py-400 shadow-sm"
          aria-label="부원 정보 필드 선택"
        >
          <span className="bg-container-neutral-alternative flex size-10 shrink-0 items-center justify-center rounded-sm">
            <Icon src={PositionIcon} size={24} className="text-icon-normal" />
          </span>
          <span className="typo-sub1 text-text-strong">포지션</span>
          <Tag variant="caution">커스텀 필드</Tag>
          <Icon
            src={ArrowDownIcon}
            size={20}
            className="text-icon-normal ml-auto shrink-0 transition-transform group-data-[state=open]:rotate-180"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="bottom"
          sideOffset={10}
          className="divide-line dark:shadow-dark max-h-[var(--radix-dropdown-menu-content-available-height)] w-[var(--radix-dropdown-menu-trigger-width)] divide-y shadow-lg"
        >
          {MEMBER_POSITION_FIELDS.map(({ label, icon, custom }) => (
            <DropdownMenuItem
              key={label}
              disabled={!custom}
              className="h-auto gap-400 px-500 py-400 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
            >
              <span className="bg-container-neutral-alternative flex size-10 shrink-0 items-center justify-center rounded-sm">
                {custom ? (
                  <Icon src={icon} size={24} className="text-icon-normal" />
                ) : (
                  <Image src={icon} width={24} height={24} alt="" />
                )}
              </span>
              <span
                className={cn('typo-sub1', custom ? 'text-text-strong' : 'text-text-alternative')}
              >
                {label}
              </span>
              {custom && (
                <Tag variant="caution" className="ml-auto">
                  커스텀 필드
                </Tag>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <MemberPositionEditor {...editorProps} mobile className="min-h-[540px]" />
    </div>
  );
}

export { MemberPositionMobile };
