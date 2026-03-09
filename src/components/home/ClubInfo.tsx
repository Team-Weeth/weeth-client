import { Avatar, AvatarImage, AvatarFallback, Button, Divider } from '@/components/ui';
import { PeopleIcon } from '@/assets/icons';
import Image from 'next/image';

export function ClubInfo() {
  return (
    <>
      <div className="flex items-center gap-4 px-200 py-300">
        <Avatar type="square">
          <AvatarImage width={64} height={64} src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex w-[172px] flex-col justify-center gap-[2px]">
          <p className="text-text-strong typo-sub1">가천대 검도부</p>
          <p className="text-text-normal typo-body2">날씨가 춥네요, 건강이 최고</p>
        </div>
      </div>
      <Divider />
      <div className="flex justify-between px-[10px] py-450">
        <div className="flex gap-200">
          <Image src={PeopleIcon} alt="people" width={20} height={20} />
          <p className="typo-button2 text-text-normal">368명</p>
        </div>
        <a className="typo-button2 text-text-alternative cursor-pointer underline underline-offset-2">
          초대
        </a>
      </div>
      <Button variant="secondary" size="md" className="w-full">
        글쓰기
      </Button>
    </>
  );
}
