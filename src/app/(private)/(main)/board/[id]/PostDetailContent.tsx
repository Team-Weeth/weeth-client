'use client';

import { Divider } from '@/components/ui';
import {
  PostCard,
  PostDetailHeader,
  PostActionMenu,
  CommentInput,
  CommentItem,
  FileList,
} from '@/components/board';
import type { FileItem } from '@/stores/usePostStore';

// TODO: API 연동 시 실제 타입으로 교체
const MOCK_POST = {
  id: '1',
  author: { name: '김위드', profileImageUrl: '' },
  date: '00/00',
  title: '이번주는 중간고사로 쉬어갑니다',
  content: `오늘 훈련은 개인적으로 좀 많이 아쉬웠습니다.

초반 기본기 훈련에서는 괜찮았는데,
스파링 들어가니까 긴장해서 그런지 자꾸 먼저 물러나게 되더라고요.
머리 타격 타이밍도 몇 번 잡았는데 망설이다가 놓쳤고요.

끝나고 생각해보니까
상대를 이기겠다는 생각보다 "맞지 말아야지"라는 생각이 더 컸던 것 같아요.
그러다 보니 자세도 작아지고 기합도 줄어들었던 것 같습니다.

그래도 좋았던 점은
예전 같으면 한 번 밀리면 계속 무너졌는데
오늘은 한 판 지고 나서 다시 들어가 보려고 했던 점입니다.

검도는 기술보다 마음이 더 중요한 것 같다는 생각이 들었습니다.
다음 훈련에서는 결과보다, 먼저 나가는 걸 목표로 해보려고 합니다.

오늘 같이 연습해준 분들 감사합니다.
다들 고생 많았어요.`,
  isNew: true,
  hasAttachment: true,
  files: [
    { id: '1', file: new File([], ''), fileName: '파일이름.pdf', fileUrl: '#', uploaded: true },
    {
      id: '2',
      file: new File([], ''),
      fileName: '파일이름이에용가리.pdf',
      fileUrl: '#',
      uploaded: true,
    },
    { id: '3', file: new File([], ''), fileName: '메롱.png', fileUrl: '#', uploaded: true },
  ] as FileItem[],
  images: [
    {
      id: 'img-1',
      file: new File([], ''),
      fileName: '훈련사진1.jpg',
      fileUrl: 'https://picsum.photos/seed/weeth1/600/400',
      uploaded: true,
    },
    {
      id: 'img-2',
      file: new File([], ''),
      fileName: '훈련사진2.jpg',
      fileUrl: 'https://picsum.photos/seed/weeth2/400/400',
      uploaded: true,
    },
    {
      id: 'img-3',
      file: new File([], ''),
      fileName: '훈련사진3.jpg',
      fileUrl: 'https://picsum.photos/seed/weeth3/500/350',
      uploaded: true,
    },
  ] as FileItem[],
  likeCount: 2,
  commentCount: 2,
  isLiked: false,
  isAuthor: true,
  comments: [
    {
      id: 1,
      profileImage: '',
      name: '홍길동',
      content: '한 줄에 공백 포함 글자 갯수 26개 미포함 20개',
      date: '00/00 00:00',
      isAuthor: true,
      replies: [
        {
          id: 1,
          profileImage: '',
          name: '홍길동',
          content: '댓글은 공백 포함 23개 미포함 17개,18개',
          date: '00/00 00:00',
          isAuthor: true,
        },
      ],
    },
  ],
};

interface PostDetailContentProps {
  id: string;
}

function PostDetailContent({ id: _id }: PostDetailContentProps) {
  // TODO: API 연동 시 id로 게시글 조회
  const post = MOCK_POST;

  return (
    <div className="bg-container-neutral flex flex-1 flex-col items-center overflow-hidden rounded-(--radius-lg)">
      <PostDetailHeader />

      <div className="flex flex-col items-start gap-600 self-stretch p-450">
        <PostCard.Header>
          <PostCard.Author
            author={post.author}
            date={post.date}
            hasAttachment={post.hasAttachment}
          />
          {post.isAuthor && <PostActionMenu />}
        </PostCard.Header>

        <PostCard.Content
          title={post.title}
          content={post.content}
          isNew={post.isNew}
          expandable={false}
          variant="detail"
        />

        <PostCard.Images files={post.images} />

        <FileList files={post.files} />

        <PostCard.Actions
          likeCount={post.likeCount}
          commentCount={post.commentCount}
          isLiked={post.isLiked}
        />
      </div>

      <div className="self-stretch px-450 py-400">
        <CommentInput placeholder="댓글을 입력하세요." />
      </div>

      <div className="self-stretch px-450">
        <Divider />
      </div>

      <div className="flex flex-col gap-[15px] self-stretch pb-300">
        {post.comments.map((comment, index) => (
          <CommentItem key={comment.id} {...comment} />
        ))}
      </div>
    </div>
  );
}

export { PostDetailContent };
