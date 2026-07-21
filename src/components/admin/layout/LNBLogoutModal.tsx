'use client';

import { Fragment, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { StaticImageData } from 'next/image';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogPortal,
  Icon,
} from '@/components/ui';
import { AdminRoundLogoutIcon, AdminSymbolIcon } from '@/assets/icons/admin';
import { cn } from '@/lib/cn';
import { LNBClubInfo } from '@/components/admin/layout/LNBClubInfo';

interface LNBLogoutModalProps {
  collapsed: boolean;
}

type MenuItemVariant = 'default' | 'danger';

interface MenuItem {
  icon: StaticImageData;
  label: string;
  onClick: () => void;
  variant?: MenuItemVariant;
}

const variantStyles: Record<
  MenuItemVariant,
  { button: string; iconSize: number; iconClass: string; textClass: string }
> = {
  default: {
    button: 'hover:bg-container-neutral-interaction px-200 py-300',
    iconSize: 20,
    iconClass: 'text-icon-alternative',
    textClass: 'text-text-normal',
  },
  danger: {
    button: 'hover:bg-container-neutral-alternative p-200',
    iconSize: 22,
    iconClass: 'text-state-error',
    textClass: 'text-state-error',
  },
};

function LNBLogoutModal({ collapsed }: LNBLogoutModalProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const { clubId } = useParams<{ clubId: string }>();
  const router = useRouter();

  const openMenu = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuTop(rect.bottom + 4);
    }
    setMenuOpen(true);
  };

  const menuSections: MenuItem[][] = [
    [
      {
        icon: AdminSymbolIcon,
        label: '동아리 정보',
        onClick: () => {
          setMenuOpen(false);
          router.push(`/${clubId}/admin/club-info`);
        },
      },
    ],
    [
      {
        icon: AdminRoundLogoutIcon,
        label: '로그아웃',
        variant: 'danger',
        onClick: () => {
          setMenuOpen(false);
          setLogoutDialogOpen(true);
        },
      },
    ],
  ];

  return (
    <>
      <div ref={triggerRef} onClick={openMenu} className="flex grow">
        <LNBClubInfo collapsed={collapsed} />
      </div>

      <AlertDialog open={menuOpen} onOpenChange={setMenuOpen}>
        <AlertDialogPortal>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div
            className="bg-container-neutral fixed z-50 flex w-[242px] flex-col gap-[4px] rounded-md p-[6px]"
            style={{ left: 16, top: menuTop, boxShadow: 'var(--shadow-sm)' }}
          >
            {menuSections.map((section, sectionIdx) => (
              <Fragment key={sectionIdx}>
                {sectionIdx > 0 && <div className="border-line w-full border-t" />}
                {section.map((item) => {
                  const style = variantStyles[item.variant ?? 'default'];
                  return (
                    <button
                      key={item.label}
                      className={cn(
                        'flex w-full items-center gap-100 rounded-sm transition-colors',
                        style.button,
                      )}
                      onClick={item.onClick}
                    >
                      <Icon src={item.icon} size={style.iconSize} className={style.iconClass} />
                      <span className={cn('typo-button2', style.textClass)}>{item.label}</span>
                    </button>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </AlertDialogPortal>
      </AlertDialog>

      <AlertDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        status="danger"
        title="로그아웃 하시겠어요?"
        description={'로그아웃 하시면 다시\n로그인해야 합니다.'}
      >
        <AlertDialogAction>로그아웃</AlertDialogAction>
        <AlertDialogCancel>취소</AlertDialogCancel>
      </AlertDialog>
    </>
  );
}

export { LNBLogoutModal, type LNBLogoutModalProps };
