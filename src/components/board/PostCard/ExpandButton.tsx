interface ExpandButtonProps {
  onExpand: () => void;
}

function ExpandButton({ onExpand }: ExpandButtonProps) {
  return (
    <button
      type="button"
      className="typo-body2 text-text-alternative hover:text-text-normal focus-visible:outline-ring cursor-pointer self-start rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onExpand();
      }}
    >
      이어서 보기
    </button>
  );
}

export { ExpandButton, type ExpandButtonProps };
