import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const chipVariants = cva(
  'inline-flex items-center min-h-[32px] py-200 px-400 typo-caption1 text-text-normal bg-transparent border border-line whitespace-nowrap',
  {
    variants: {
      shape: {
        square: 'rounded-[10px]',
        round: 'rounded-[999px]',
      },
    },
    defaultVariants: {
      shape: 'round',
    },
  },
);

interface ChipProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof chipVariants> {}

function Chip({ className, shape, ...props }: ChipProps) {
  return <button className={cn(chipVariants({ shape }), className)} {...props} />;
}

function ChipList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-nowrap gap-100', className)} {...props} />;
}

export { Chip, chipVariants, ChipList, type ChipProps };
