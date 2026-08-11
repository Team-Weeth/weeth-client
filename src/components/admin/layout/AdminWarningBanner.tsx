import { CautionIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';

function AdminWarningBanner() {
  return (
    <div className="border-line bg-state-caution/10 flex shrink-0 items-start gap-200 border-b px-500 py-300">
      <Icon src={CautionIcon} size={20} className="text-state-caution mt-[2px] shrink-0" />
      <div className="flex min-w-0 flex-col gap-100">
        <p className="typo-sub3 text-text-strong">관리자 경고 기능이 활성화되어 있어요.</p>
        <p className="typo-body2 text-text-alternative">
          Flagsmith의 enable_admin_warning 플래그로 노출 여부를 제어하는 POC 배너입니다.
        </p>
      </div>
    </div>
  );
}

export { AdminWarningBanner };
