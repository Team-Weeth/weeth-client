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
      // Figma 기준: 제목줄에서 일러스트까지 모바일 114px·데스크톱 34px(본문 18 + 16), 문구→버튼 56px(16 + 40).
      className={cn('tablet:pt-[34px] flex flex-col items-center gap-800 pt-[114px]', className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-400 pb-400">
        <Image src={FeedbackCompleteImage} alt="" width={120} height={120} />
        <div className="flex flex-col items-center gap-200 text-center">
          <p className="typo-sub1 text-text-strong">피드백이 전달됐어요!</p>
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
