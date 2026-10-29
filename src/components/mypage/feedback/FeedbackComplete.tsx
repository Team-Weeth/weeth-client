import Image from 'next/image';
import FeedbackCompleteImage from '@/assets/image/feedback_complete.png';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

interface FeedbackCompleteProps extends React.HTMLAttributes<HTMLDivElement> {
  onRewrite: () => void;
}

function FeedbackComplete({ onRewrite, className, ...props }: FeedbackCompleteProps) {
  return (
    <div
      className={cn('tablet:pt-400 flex flex-col items-center gap-700 pt-[88px]', className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-400">
        <Image src={FeedbackCompleteImage} alt="" width={120} height={120} />
        <div className="flex flex-col items-center gap-200 text-center">
          <p className="typo-sub3 text-text-strong">피드백이 전달됐어요!</p>
          <p className="typo-body2 text-text-alternative">소중한 의견 감사합니다.</p>
        </div>
      </div>
      <Button variant="secondary" size="lg" onClick={onRewrite}>
        새로 작성하기
      </Button>
    </div>
  );
}

export { FeedbackComplete, type FeedbackCompleteProps };
