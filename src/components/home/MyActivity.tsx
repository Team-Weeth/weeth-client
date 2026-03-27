import Image from 'next/image';
import { PeopleIcon, CopyIcon } from '@/assets/icons';
import { Avatar, AvatarFallback, AvatarImage, Divider, Button, Icon } from '../ui';
import { AlertBanner } from './AlertBanner';

export function MyActivity() {
  return (
    <>
      <div className="flex items-center gap-4 px-200 py-300">
        <Avatar type="round">
          <AvatarImage width={64} height={64} alt="clubImage" src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex w-[172px] flex-col justify-center gap-[2px]">
          <p className="text-text-strong typo-sub1">김위드</p>
          <p className="text-text-normal typo-body2">잘부탁드립니다.</p>
        </div>
      </div>
      <Divider />
      <div className="flex justify-between px-[10px] py-450">
        <div className="flex gap-200">
          <Image src={PeopleIcon} alt="people" width={20} height={20} />
          <p className="typo-button2 text-text-normal">368명</p>
        </div>
        <a className="typo-button2 text-text-alternative flex cursor-pointer gap-200 underline underline-offset-2">
          초대
          <Icon src={CopyIcon} alt="copy" className="text-icon-alternative" />
        </a>
      </div>
      <Button variant="secondary" size="md" className="w-full">
        글쓰기
      </Button>
      <AlertBanner />
    </>
  );
}
