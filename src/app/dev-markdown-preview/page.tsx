import { notFound } from 'next/navigation';

import { PostCardBody } from '@/components/board/PostCard/PostCardBody';

import { conversionSamples } from './samples';

/**
 * v3 마크다운 본문의 백엔드 HTML 변환 결과를 눈으로 확인하기 위한 개발 전용 페이지.
 * 왼쪽은 변환 전(현재 DB 본문), 오른쪽은 백엔드 변환 후 본문이며 둘 다 실제 게시글 본문 컴포넌트로 렌더한다.
 */
export default function DevMarkdownPreviewPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-10 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="typo-h1 text-text-normal">마크다운 → Tiptap HTML 변환 미리보기</h1>
        <p className="typo-body2 text-text-alternative">
          왼쪽은 변환하지 않은 현재 본문, 오른쪽은 백엔드가 변환한 본문입니다. 둘 다 게시글 조회에
          쓰이는 본문 컴포넌트로 렌더했습니다.
        </p>
      </header>

      {conversionSamples.map((sample) => (
        <section key={sample.name} className="flex flex-col gap-3">
          <h2 className="typo-h2 text-text-normal border-line border-b pb-2">{sample.name}</h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <article className="flex flex-col gap-2">
              <h3 className="typo-body2 font-semibold text-red-500">변환 전 (현재 상태)</h3>
              <div className="border-line min-h-40 rounded-lg border p-4">
                <PostCardBody content={sample.raw} />
              </div>
            </article>

            <article className="flex flex-col gap-2">
              <h3 className="typo-body2 font-semibold text-green-600">변환 후 (백엔드 처리)</h3>
              <div className="border-line min-h-40 rounded-lg border p-4">
                <PostCardBody content={sample.converted} />
              </div>
            </article>
          </div>

          <details className="text-text-alternative typo-caption1">
            <summary className="cursor-pointer py-2">원본 / 변환 결과 문자열 보기</summary>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <pre className="overflow-x-auto rounded bg-gray-100 p-3 whitespace-pre-wrap">
                {sample.raw}
              </pre>
              <pre className="overflow-x-auto rounded bg-gray-100 p-3 whitespace-pre-wrap">
                {sample.converted}
              </pre>
            </div>
          </details>
        </section>
      ))}
    </main>
  );
}
