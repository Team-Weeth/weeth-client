'use client';

interface ExpandableScheduleTitleProps {
  title: string;
}

function ExpandableScheduleTitle({ title }: ExpandableScheduleTitleProps) {
  return (
    <p className="typo-body1 text-text-strong line-clamp-2 break-words whitespace-normal">
      {title}
    </p>
  );
}

export { ExpandableScheduleTitle, type ExpandableScheduleTitleProps };
