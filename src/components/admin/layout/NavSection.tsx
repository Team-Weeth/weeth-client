interface NavSectionProps {
  label?: string;
  collapsed?: boolean;
  children: React.ReactNode;
}

function NavSection({ label, collapsed, children }: NavSectionProps) {
  return (
    <div className="flex flex-col gap-100 px-400 py-400">
      {label && !collapsed && (
        <span className="typo-caption1 text-text-alternative pt-100 pb-300">{label}</span>
      )}
      {children}
    </div>
  );
}

export { NavSection, type NavSectionProps };
