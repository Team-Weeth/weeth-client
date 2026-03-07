import Image from 'next/image';
import { NewIcon, ArrowRightIcon } from '@/assets/icons';
import { Tag } from '@/components/ui';

export function NoticeBoardBox() {
  return (
    <div className="bg-container-neutral flex flex-col rounded-lg pb-300">
      <div className="flex items-center justify-between p-450">
        <p className="typo-sub1 text-text-strong">공지</p>
        <Image
          src={ArrowRightIcon}
          alt="arrow-right"
          width={24}
          height={24}
          className="cursor-pointer"
        />
      </div>
      <div className="flex flex-col items-center justify-center gap-200">
        <div className="flex flex-col gap-300 px-450 py-400">
          <Tag color="#FF5857" bgColor="#FF58581A">
            공지
          </Tag>
          <div className="flex flex-col gap-[5px]">
            <div className="flex gap-[5px]">
              <p className="typo-sub2 text-text-strong">이번주는 중간고사로 쉬어갑니다</p>
              <Image src={NewIcon} alt="new" width={9} height={16} />
            </div>
            <p className="typo-body2 text-text-alternative line-clamp-2 max-w-[268px]">
              여러분 벌써 중간고사가 다가왔습니다. 다들 열심히 시험공부 잘 하고 계신가요? 릿츠 4기와
              함께한지도 벌써 4주가 지났습니다. 앞으로도 응원
            </p>
          </div>
        </div>
        {/* 추후 Divider 추가 */}
        <div className="flex flex-col gap-300 px-450 py-400">
          <Tag color="#FF5857" bgColor="#FF58581A">
            공지
          </Tag>
          <div className="flex flex-col gap-[5px]">
            <div className="flex gap-[5px]">
              <p className="typo-sub2 text-text-strong">이번주는 중간고사로 쉬어갑니다</p>
              <Image src={NewIcon} alt="new" width={9} height={16} />
            </div>
            <p className="typo-body2 text-text-alternative line-clamp-2 max-w-[268px]">
              여러분 벌써 중간고사가 다가왔습니다. 다들 열심히 시험공부 잘 하고 계신가요? 릿츠 4기와
              함께한지도 벌써 4주가 지났습니다. 앞으로도 응원
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-300 px-450 py-400">
          <Tag color="#FF5857" bgColor="#FF58581A">
            공지
          </Tag>
          <div className="flex flex-col gap-[5px]">
            <div className="flex gap-[5px]">
              <p className="typo-sub2 text-text-strong">이번주는 중간고사로 쉬어갑니다</p>
              <Image src={NewIcon} alt="new" width={9} height={16} />
            </div>
            <p className="typo-body2 text-text-alternative line-clamp-2 max-w-[268px]">
              여러분 벌써 중간고사가 다가왔습니다. 다들 열심히 시험공부 잘 하고 계신가요? 릿츠 4기와
              함께한지도 벌써 4주가 지났습니다. 앞으로도 응원
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
