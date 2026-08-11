import HubCreateIcon from '@/assets/icons/hub_create.svg';
import HubGoIcon from '@/assets/icons/hub_go.svg';
import HubJoinIcon from '@/assets/icons/hub_join.svg';
import type { ButtonProps } from '@/components/ui/Button';

export const HUB_ACTION_CONFIG = {
  create: {
    icon: HubCreateIcon,
    title: '사이트 새로 개설하기',
    description: '새로운 동아리 사이트를 개설하고 싶은 리더님은 여기!',
    buttonText: '개설',
    buttonVariant: 'secondary' as ButtonProps['variant'],
  },
  join: {
    icon: HubJoinIcon,
    title: '동아리에 가입하기',
    description: 'Weeth에 개설된 동아리에 가입하려는 부원님은 여기!',
    buttonText: '가입',
    buttonVariant: 'secondary' as ButtonProps['variant'],
  },
  go: {
    icon: HubGoIcon,
    title: '가입한 동아리 바로가기',
    description: '이미 가입한 동아리의 사이트로 이동하려는 부원님은 여기!',
    buttonText: '바로가기',
    buttonVariant: 'secondary' as ButtonProps['variant'],
  },
} as const;
