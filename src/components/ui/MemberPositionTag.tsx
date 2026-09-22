import { Tag, type TagProps } from '@/components/ui/tag';
import { getPositionTagVariant, type MemberPositionColor } from '@/constants/admin/memberPosition';

interface MemberPositionTagProps extends Omit<TagProps, 'variant' | 'color'> {
  color: MemberPositionColor;
}

function MemberPositionTag({ color, ...props }: MemberPositionTagProps) {
  return <Tag variant={getPositionTagVariant(color)} {...props} />;
}

export { MemberPositionTag, type MemberPositionTagProps };
