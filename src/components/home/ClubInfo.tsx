import { Avatar, AvatarImage, AvatarFallback, Button } from '@/components/ui';
import { PeopleIcon } from '@/assets/icons';
import Image from 'next/image';

export function ClubInfo() {
  return (
    <>
      <div className="mt-[18px] mb-5 flex items-center justify-center gap-4 px-200">
        <Avatar>
          <AvatarImage width={56} height={56} src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-[2px]">
          <p className="text-text-strong typo-sub1">가천대 검도부</p>
          <p className="text-text-normal typo-body2">날씨가 춥네요, 건강이 최고</p>
        </div>
      </div>
      {/* Divider 추가 */}
      <div className="flex justify-between px-[10px] py-[18px]">
        <div className="flex gap-[10px]">
          <Image src={PeopleIcon} alt="people" width={20} height={20} />
          <p className="typo-button2 text-text-normal">368명</p>
        </div>
        <a className="typo-button2 text-text-alternative underline underline-offset-2">초대</a>
      </div>
      <Button variant="secondary" size="md" className="w-full">
        글쓰기
      </Button>
    </>
  );
}
