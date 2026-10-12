'use client';

import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

interface AvatarMenuButtonProps {
  profileImageUrl?: string | null;
  size?: 128 | 100 | 64 | 40 | 36 | 28 | 24;
}

function AvatarMenuButton({ profileImageUrl, size = 40 }: AvatarMenuButtonProps) {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="마이페이지 메뉴" className="cursor-pointer rounded-full">
          <Avatar size={size} type="round">
            {profileImageUrl && (
              <AvatarImage
                key={profileImageUrl}
                src={profileImageUrl}
                alt="avatar"
                className="object-cover"
              />
            )}
            <AvatarFallback />
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={12} collisionPadding={{ right: 18 }}>
        <DropdownMenuItem onSelect={() => router.push(`/${clubId}/mypage`)}>
          프로필
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push(`/${clubId}/mypage/activity`)}>
          활동 정보
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push(`/${clubId}/mypage/settings`)}>
          서비스 설정
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { AvatarMenuButton };
