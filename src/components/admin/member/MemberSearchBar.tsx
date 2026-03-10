'use client';

import Image from 'next/image';
import { cn } from '@/lib/cn';
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup } from '@/components/ui';
import { AdminSearchIcon } from '@/assets/icons';

interface AdminUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface MemberSearchBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  admins?: AdminUser[];
}

function MemberSearchBar({ className, value, onValueChange, admins = [], ...props }: MemberSearchBarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-400 rounded-lg bg-container-neutral px-500 py-300',
        className,
      )}
      {...props}
    >
      <Image src={AdminSearchIcon} alt="검색" width={20} height={20} className="shrink-0 text-icon-alternative" />
      <input
        type="text"
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        placeholder="Search for name"
        className="min-w-0 flex-1 bg-transparent typo-body2 text-text-normal placeholder:text-text-alternative focus:outline-none"
      />
      {admins.length > 0 && (
        <AvatarGroup className="shrink-0">
          {admins.map((admin) => (
            <Avatar key={admin.id} size={24}>
              {admin.avatarUrl ? (
                <AvatarImage src={admin.avatarUrl} alt={admin.name} />
              ) : (
                <AvatarFallback>{admin.name.slice(0, 1)}</AvatarFallback>
              )}
            </Avatar>
          ))}
        </AvatarGroup>
      )}
    </div>
  );
}

export { MemberSearchBar, type MemberSearchBarProps };
