import { Button } from '../ui';

interface EmptyBoxProps {
  description: string;
  button?: {
    label: string;
    onClick: () => void;
  };
}

function EmptyBox({ description, button }: EmptyBoxProps) {
  return (
    <div className="bg-background flex flex-col gap-[10px] rounded-md p-300">
      <p className="typo-body2 text-text-alternative">{description}</p>
      {button && (
        <Button variant="secondary" size="lg" className="w-full" onClick={button.onClick}>
          {button.label}
        </Button>
      )}
    </div>
  );
}

export { EmptyBox, type EmptyBoxProps };
