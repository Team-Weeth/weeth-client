import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

const boardFormFieldLabelVariants = cva('text-text-normal flex h-12 items-center px-400', {
  variants: {
    labelVariant: {
      caption: 'typo-caption1',
      sub3: 'typo-sub3',
    },
  },
  defaultVariants: {
    labelVariant: 'caption',
  },
});

interface BoardFormFieldProps extends VariantProps<typeof boardFormFieldLabelVariants> {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}

function BoardFormField({ label, htmlFor, labelVariant, children }: BoardFormFieldProps) {
  const labelClass = cn(boardFormFieldLabelVariants({ labelVariant }));

  return (
    <div className="flex flex-col">
      {htmlFor ? (
        <label htmlFor={htmlFor} className={labelClass}>
          {label}
        </label>
      ) : (
        <span className={labelClass}>{label}</span>
      )}
      {children}
    </div>
  );
}

export { BoardFormField, boardFormFieldLabelVariants, type BoardFormFieldProps };
