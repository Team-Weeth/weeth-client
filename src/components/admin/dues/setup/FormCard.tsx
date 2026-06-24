import { ReactNode } from 'react';

interface FormCardProps {
  title: string;
  step: number;
  description: string;
  children: ReactNode;
}
function FormCard({ title, step, description, children }: FormCardProps) {
  return (
    <div className="bg-container-neutral flex flex-col gap-600 rounded-lg px-400 py-450">
      {/* 섹션 헤더 */}
      <div className="flex flex-col gap-200">
        <span className="typo-caption1 text-text-alternative">
          {title} ({step}/5)
        </span>
        <h2 className="typo-h3 text-text-normal">{description}</h2>
      </div>
      {children}
    </div>
  );
}

export { FormCard, type FormCardProps };
