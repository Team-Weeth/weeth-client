import { Tag, type TagProps } from '@/components/ui/tag';
import type { MemberRole } from '@/types/member';

const ROLE_LABEL: Record<MemberRole, string> = {
  LEAD: '회장',
  ADMIN: '운영진',
  USER: '일반회원',
};

const ROLE_VARIANT: Record<MemberRole, TagProps['variant']> = {
  LEAD: 'primary',
  ADMIN: 'secondary',
  USER: 'neutral',
};

interface MemberRoleTagProps extends Omit<TagProps, 'variant'> {
  role: MemberRole;
}

function MemberRoleTag({ role, ...props }: MemberRoleTagProps) {
  return (
    <Tag variant={ROLE_VARIANT[role]} {...props}>
      {ROLE_LABEL[role]}
    </Tag>
  );
}

export { MemberRoleTag, type MemberRoleTagProps };
