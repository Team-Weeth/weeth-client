interface NavSectionProps {
  label?: string;
  collapsed?: boolean;
  children: React.ReactNode;
}

function NavSection({ label, collapsed, children }: NavSectionProps) {
  return (
    <div className="flex flex-col">
      {label && !collapsed && (
        <span className="typo-caption1 text-text-alternative px-400 pt-500 pb-300">{label}</span>
      )}
      {children}
    </div>
  );
}

export { NavSection, type NavSectionProps };
