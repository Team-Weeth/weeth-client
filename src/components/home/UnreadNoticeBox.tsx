import Image from 'next/image';
import { NewIcon, DeleteIcon } from '@/assets/icons';

export function UnreadNoticeBox() {
  return (
    <div className="flex flex-col">
      <div className="bg-container-primary text-icon-inverse flex items-center justify-between rounded-t-lg px-450 pt-450 pb-300">
        <p>읽지 않은 최근 공지가 있어요</p>
        <Image src={DeleteIcon} alt="delete" width={24} height={24} className="cursor-pointer" />
      </div>
      <div className="bg-container-neutral flex flex-col gap-[5px] rounded-b-lg px-450 py-400">
        <div className="flex gap-[5px]">
          <p className="typo-sub2 text-text-strong">이번주는 중간고사로 쉬어갑니다</p>
          <Image src={NewIcon} alt="delete" width={9} height={16} />
        </div>
        <p className="typo-button2 text-text-normal w-[604px]">
          여러분 벌써 중간고사가 다가왔습니다. 다들 열심히 시험공부 잘 하고 계신가요? 릿츠 4기와
          함께한지도 벌써 4주가 지났습니다. 앞으로도 응원
        </p>
      </div>
    </div>
  );
}
