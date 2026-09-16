import type { TagProps } from '@/components/ui/tag';

export const POSITION_COLORS = [
  { value: 'primary', label: '민트', className: 'bg-brand-primary', tagVariant: 'primary' },
  { value: 'secondary', label: '파랑', className: 'bg-brand-secondary', tagVariant: 'secondary' },
  { value: 'purple', label: '보라', className: 'bg-brand-purple', tagVariant: 'purple' },
  { value: 'pink', label: '분홍', className: 'bg-brand-pink', tagVariant: 'pink' },
  { value: 'caution', label: '노랑', className: 'bg-state-caution', tagVariant: 'caution' },
  { value: 'error', label: '빨강', className: 'bg-state-error', tagVariant: 'error' },
] as const satisfies ReadonlyArray<{
  value: string;
  label: string;
  className: string;
  tagVariant: NonNullable<TagProps['variant']>;
}>;

export type MemberPositionColor = (typeof POSITION_COLORS)[number]['value'];

export function getPositionTagVariant(color: MemberPositionColor) {
  return POSITION_COLORS.find((option) => option.value === color)!.tagVariant;
}
