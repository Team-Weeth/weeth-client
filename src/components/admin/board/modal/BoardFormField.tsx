import { cn } from '@/lib/cn';

type LabelVariant = 'caption' | 'sub3';

interface BoardFormFieldProps {
  label: string;
  htmlFor?: string;
  labelVariant?: LabelVariant;
  children: React.ReactNode;
}

const LABEL_TYPO: Record<LabelVariant, string> = {
  caption: 'typo-caption1',
  sub3: 'typo-sub3',
};

function BoardFormField({
  label,
  htmlFor,
  labelVariant = 'caption',
  children,
}: BoardFormFieldProps) {
  const labelClass = cn(
    'text-text-normal flex h-12 items-center px-400',
    LABEL_TYPO[labelVariant],
  );

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

export { BoardFormField, type BoardFormFieldProps };
