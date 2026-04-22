import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import { cn } from '@/lib/cn';

interface ProfileSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  bio?: string;
  profileImageUrl?: string;
}

function ProfileSection({ name, bio, profileImageUrl, className, ...props }: ProfileSectionProps) {
  return (
    <div className={cn('flex items-center gap-300', className)} {...props}>
      <Avatar size={128} type="round">
        <AvatarImage
          key={profileImageUrl ?? 'fallback'}
          src={profileImageUrl ?? undefined}
          alt={name}
          className="object-cover"
        />
        <AvatarFallback />
      </Avatar>
      <div className="flex flex-col gap-200">
        <h1 className="typo-h2 text-text-strong">{name}</h1>
        {bio && <p className="typo-body1 text-text-alternative">{bio}</p>}
      </div>
    </div>
  );
}

export { ProfileSection, type ProfileSectionProps };
