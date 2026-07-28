interface CollapsedDividerProps {
  collapsed?: boolean;
}

function CollapsedDivider({ collapsed }: CollapsedDividerProps) {
  if (collapsed) return null;

  return <div className="border-line w-[200px] shrink-0 self-center border-b" />;
}

export { CollapsedDivider, type CollapsedDividerProps };
