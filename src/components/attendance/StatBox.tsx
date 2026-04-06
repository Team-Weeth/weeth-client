interface StatBoxProps {
  label: string;
  value: string;
}

function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="bg-container-neutral-interaction flex flex-1 flex-col items-center gap-[17px] rounded-md pt-[15px] pb-[19px]">
      <span className="typo-body2 text-text-alternative">{label}</span>
      <span className="typo-sub1 text-text-strong tabular-nums">{value}</span>
    </div>
  );
}

export { StatBox, type StatBoxProps };
