'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { StaticImageData } from 'next/image';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, Icon } from '@/components/ui';
import { AdminRoundLogoutIcon, AdminSymbolIcon } from '@/assets/icons/admin';
import { AdminScopeBoundary } from '@/providers';
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

const ANIMATION_DURATION = 200;

function LNBLogoutModal({ collapsed }: LNBLogoutModalProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const { clubId } = useParams<{ clubId: string }>();
  const router = useRouter();

  if (menuOpen && !menuMounted) {
    setMenuMounted(true);
  }

  useEffect(() => {
    if (menuOpen) return;
    const id = setTimeout(() => setMenuMounted(false), ANIMATION_DURATION);
    return () => clearTimeout(id);
  }, [menuOpen]);

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
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        onClick={openMenu}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openMenu();
          }
        }}
        className="flex grow"
      >
        <LNBClubInfo collapsed={collapsed} />
      </div>

      <DialogPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
        {menuMounted && (
          <DialogPrimitive.Portal forceMount>
            <AdminScopeBoundary>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <DialogPrimitive.Content
                forceMount
                className={cn(
                  'bg-container-neutral fixed z-50 flex w-[242px] flex-col gap-[4px] rounded-md p-[6px] outline-none',
                  'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2',
                  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2',
                  'duration-200',
                )}
                style={{ left: 16, top: menuTop, boxShadow: 'var(--shadow-sm)' }}
              >
                <DialogPrimitive.Title className="sr-only">동아리 메뉴</DialogPrimitive.Title>
                {menuSections.map((section, i) => (
                  <Fragment key={section[0].label}>
                    {i > 0 && <div className="border-line w-full border-t" />}
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
              </DialogPrimitive.Content>
            </AdminScopeBoundary>
          </DialogPrimitive.Portal>
        )}
      </DialogPrimitive.Root>

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
