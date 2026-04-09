import { Button, Divider } from '@/components/ui';

interface ModalFooterProps {
  children?: React.ReactNode;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
  primaryDisabled?: boolean;
}

function ModalFooter({
  children,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  primaryDisabled,
}: ModalFooterProps) {
  return (
    <div className="fixed bottom-0 flex w-full flex-col gap-[10px] px-400 pt-px pb-400">
      <Divider />
      {children}
      <div className="flex gap-200 pt-300">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onSecondary}>
          {secondaryLabel}
        </Button>
        <Button size="lg" className="flex-1" disabled={primaryDisabled} onClick={onPrimary}>
          {primaryLabel}
        </Button>
      </div>
    </div>
  );
}

export { ModalFooter, type ModalFooterProps };
