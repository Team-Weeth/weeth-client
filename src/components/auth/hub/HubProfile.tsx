'use client';

import { useAuthName } from '@/stores';

interface HubProfileProps extends React.HTMLAttributes<HTMLDivElement> {
  description?: string;
}

function HubProfile({ className, description, ...props }: HubProfileProps) {
  const name = useAuthName();

  return (
    <div className={className} {...props}>
      <div className="typo-h3 text-text-strong text-center">
        {name ? `${name}님, ` : ''}반가워요!
        <br />
        {description ?? '어떤 동아리 활동을 시작할까요?'}
      </div>
    </div>
  );
}

export { HubProfile };
