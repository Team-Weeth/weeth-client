interface CollapsedDividerProps {
  collapsed?: boolean;
}

function CollapsedDivider({ collapsed }: CollapsedDividerProps) {
  if (!collapsed) return null;

  return <div className="border-icon-alternative my-200 w-6 self-center border-b" />;
}

export { CollapsedDivider, type CollapsedDividerProps };
