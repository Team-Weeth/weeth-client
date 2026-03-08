import { PostCard } from '@/components/board/PostCard';

const MOCK_POST = {
  author: {
    name: '김위드',
    profileImageUrl: '',
  },
  date: '00/00',
  title: '이번주는 중간고사로 쉬어갑니다',
  content: `8줄 이상일 때는 이렇게 표시돼요.
  오늘 훈련은 개인적으로 좀 많이 아쉬웠습니다.

초반 기본기 훈련에서는 괜찮았는데,
스파링 들어가니까 긴장해서 그런지 자꾸 먼저 물러나게 되더라고요.
머리 타격 타이밍도 몇 번 잡았는데 망설이다가 놓쳤고요.

끝나고 생각해보니까
상대를 이기겠다는 생각보다 "맞지 말아야지"라는 생각이 더 컸던 것 같아요\u2026.`,
  isNew: true,
  hasAttachment: true,
  images: [
    {
      id: '1',
      file: new File([], ''),
      fileName: 'kendo-1.jpg',
      fileUrl: 'https://placehold.co/280x280',
      uploaded: true,
    },
    {
      id: '2',
      file: new File([], ''),
      fileName: 'kendo-2.jpg',
      fileUrl: 'https://placehold.co/280x280',
      uploaded: true,
    },
    {
      id: '3',
      file: new File([], ''),
      fileName: 'kendo-3.jpg',
      fileUrl: 'https://placehold.co/280x280',
      uploaded: true,
    },
  ],
  likeCount: 2,
  commentCount: 2,
};

export default function BoardPage() {
  return (
    <div className="flex flex-col gap-400 p-400">
      <PostCard {...MOCK_POST} />
    </div>
  );
}
