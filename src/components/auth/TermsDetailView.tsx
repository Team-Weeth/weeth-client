import ArrowLeftIcon from '@/assets/icons/arrow_left.svg';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/Icon';
import { PolicyBody } from '@/components/policy';
import type { TermsItem } from '@/constants/login';

interface TermsDetailViewProps {
  term: TermsItem;
  onBack: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function TermsDetailView({ term, onBack, open, onOpenChange }: TermsDetailViewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="z-90 w-full max-w-160"
        overlayClassName="z-90"
      >
        <DialogHeader>
          <button type="button" onClick={onBack} className="cursor-pointer">
            <Icon src={ArrowLeftIcon} size={12} alt="뒤로 가기" className="text-icon-normal" />
          </button>
        </DialogHeader>
        <DialogBody className="max-h-[400px]">
          <h2 className="typo-h3 text-text-strong">{term.policy.title}</h2>
          <PolicyBody data={term.policy} />
        </DialogBody>
        <DialogFooter showDivider>
          <Button variant="secondary" size="lg" onClick={onBack}>
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { TermsDetailView };
