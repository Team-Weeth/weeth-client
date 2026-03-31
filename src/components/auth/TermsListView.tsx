import { ArrowRightIcon, CheckRoundIcon } from '@/assets/icons';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Divider,
  Icon,
} from '@/components/ui';
import { TERMS_DESCRIPTION, TERMS_ITEMS, type TermsItem } from '@/constants/login';
import { cn } from '@/lib/cn';

interface TermsListViewProps {
  checkedItems: Set<string>;
  onToggleItem: (id: string) => void;
  onToggleAll: () => void;
  onSelectTerm: (id: string) => void;
  allChecked: boolean;
  allRequiredChecked: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgree: () => void;
}

function TermsListView({
  checkedItems,
  onToggleItem,
  onToggleAll,
  onSelectTerm,
  allChecked,
  allRequiredChecked,
  open,
  onOpenChange,
  onAgree,
}: TermsListViewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="w-full max-w-[640px]">
        <DialogHeader title="이용 및 정보 제공 약관" />
        <DialogBody>
          {/* 전체 동의 */}
          <button
            type="button"
            onClick={onToggleAll}
            className="flex cursor-pointer items-center gap-300"
          >
            <Icon
              src={CheckRoundIcon}
              size={24}
              alt="전체 동의"
              className={cn(allChecked ? 'text-brand-primary' : 'text-icon-disabled')}
            />
            <span className="typo-sub2 text-text-strong">모두 확인하였고 이에 동의합니다.</span>
          </button>
          <p className="typo-caption2 text-text-alternative pl-[36px]">{TERMS_DESCRIPTION}</p>

          <Divider className="my-100" />

          {/* 개별 약관 항목 */}
          {TERMS_ITEMS.map((item: TermsItem, index: number) => {
            const isChecked = checkedItems.has(item.id);
            return (
              <div key={item.id} className="flex flex-col gap-300">
                {index > 0 && <Divider />}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onToggleItem(item.id)}
                    className="flex cursor-pointer items-center gap-300"
                  >
                    <Icon
                      src={CheckRoundIcon}
                      size={24}
                      alt={isChecked ? '선택됨' : '선택 안됨'}
                      className={cn(isChecked ? 'text-brand-primary' : 'text-icon-disabled')}
                    />
                    <span className="typo-sub2 text-text-normal">
                      {item.label}
                      {item.required && (
                        <span className="text-text-normal typo-sub2 ml-100">(필수)</span>
                      )}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTerm(item.id)}
                    className="cursor-pointer p-100"
                  >
                    <Icon
                      src={ArrowRightIcon}
                      size={12}
                      alt="상세 보기"
                      className="text-icon-alternative"
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </DialogBody>
        <DialogFooter showDivider>
          <Button variant="primary" size="lg" disabled={!allRequiredChecked} onClick={onAgree}>
            동의 및 계속
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { TermsListView };
