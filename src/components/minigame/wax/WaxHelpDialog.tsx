'use client';

import type { ReactNode, Ref } from 'react';

const SECTIONS: { title: string; items: { label?: string; text: string; more?: string }[] }[] = [
  {
    title: '모바일',
    items: [
      { label: '이동', text: '조이스틱을 움직여요.' },
      {
        label: '둘러보기',
        text: '화면을 드래그해요.',
        more: '앉아 있을 때도 같은 방법으로 둘러볼 수 있어요.',
      },
      { label: '앉기', text: '빈 의자 근처에서 앉기 버튼을 눌러요.' },
      { label: '왁뿌볼 깨기', text: '왁뿌볼을 꾹 눌러요.' },
      { label: '감정 표현', text: '감정 버튼을 눌러 친구들에게 보여줘요.' },
    ],
  },
  {
    title: 'PC',
    items: [
      { label: '이동', text: 'WASD 또는 방향키로 걷고, Shift를 눌러 달려요.' },
      { label: '둘러보기', text: '마우스로 드래그하고, 휠로 확대하거나 축소해요.' },
      { label: '1인칭 전환', text: 'V를 누르고, Esc로 해제해요.' },
      {
        label: '앉기·일어나기',
        text: '빈 의자 근처에서 E를 누르거나 버튼을 클릭해 앉아요. Q를 누르면 일어나요.',
      },
      {
        label: '앉아서 둘러보기',
        text: '화면을 한 번 클릭하면 마우스가 고정돼요. 이후 마우스를 움직여 둘러볼 수 있어요.',
      },
      { label: '왁뿌볼 깨기', text: 'Space 또는 마우스로 왁뿌볼을 꾹 눌러요.' },
      { label: '감정 표현', text: '숫자 1~4 또는 감정 버튼을 눌러 친구들에게 보여줘요.' },
    ],
  },
  {
    title: 'Tip',
    items: [
      { text: '왁뿌볼을 누르다가 손을 떼면 소음이 줄어들어요.' },
      { text: '교수님이 돌아보는 중에는 같은 소리도 더 크게 들켜요.' },
      { text: '들키면 다가오는 교수님 쪽으로 시선이 저절로 돌아가요.' },
    ],
  },
];

function Credit({ children }: { children: ReactNode }) {
  return <p className="typo-caption2 text-text-alternative font-normal">{children}</p>;
}

/** 조작 방법과 출처. 작은 화면에서는 본문만 스크롤되고 제목과 아래 버튼은 고정된다. */
export function WaxHelpDialog({
  ref,
  weethUrl,
}: {
  ref: Ref<HTMLDialogElement>;
  weethUrl: string;
}) {
  return (
    <dialog
      ref={ref}
      aria-label="조작 방법과 출처"
      className="bg-container-neutral m-auto w-[min(calc(100vw-32px),343px)] overflow-hidden rounded-[16px] p-0 backdrop:bg-black/40 open:flex open:max-h-[min(884px,calc(100dvh-48px))] open:flex-col"
    >
      <h2 className="text-text-normal shrink-0 px-[20px] pt-[18px] pb-[14px] text-[22px] leading-[28px] font-semibold tracking-[-0.005em]">
        조작 방법
      </h2>
      {/* 내용 높이를 기준으로 두고 최대 높이에 닿을 때만 줄어든다. flex-1(기준 0)이면 WebKit에서 본문이 접힌다. */}
      <div className="min-h-0 flex-auto overflow-x-hidden overflow-y-auto">
        <div className="flex flex-col items-center gap-[10px] px-[14px] pb-[16px]">
          {SECTIONS.map((section) => (
            <section
              key={section.title}
              className="bg-background flex w-full flex-col gap-[8px] rounded-[10px] px-[16px] py-[14px]"
            >
              <h3 className="typo-button2 text-text-normal">{section.title}</h3>
              <ul className="flex flex-col gap-[4px]">
                {section.items.map((item) => (
                  <li key={item.text} className="flex items-start gap-[8px]">
                    <span className="bg-text-normal mt-[8px] size-[2px] shrink-0 rounded-full" />
                    <div className="typo-caption2 text-text-normal flex min-w-0 flex-1 flex-col gap-[4px] font-normal">
                      <p>
                        {item.label && <span className="font-medium">{item.label}: </span>}
                        {item.text}
                      </p>
                      {item.more && <p>{item.more}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <hr className="border-line w-[calc(100%-12px)]" />
          <div className="flex w-[calc(100%-12px)] flex-col gap-[6px]">
            <p className="typo-caption1 text-text-normal">출처</p>
            <div className="flex flex-col gap-[4px]">
              <Credit>
                왁뿌볼 소리:{' '}
                <a
                  className="underline"
                  href="https://github.com/apple77771/wakppuball-simulator"
                  target="_blank"
                  rel="noreferrer"
                >
                  WAK-PPU-BALL sound effects
                </a>{' '}
                by apple77771,{' '}
                <a
                  className="underline"
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noreferrer"
                >
                  CC BY 4.0
                </a>
                .
              </Credit>
              <Credit>게임에서 구간·음높이·음량을 바꿔 재생해요.</Credit>
              <Credit>회초리·교실 배경음: Freesound CC0(Qat, okieactor, SEF7, DeanHopkins).</Credit>
              <Credit>캐릭터: Kenney Mini Characters (CC0).</Credit>
              <Credit>자세한 내용은 /audio/wax/CREDITS.md에 있어요.</Credit>
            </div>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-col px-[20px] pt-[7px] pb-[12px]">
        {/* 말풍선은 버튼 위에서 위아래로 살짝 떠다닌다. 버튼과 레이아웃은 움직이지 않는다. */}
        <div className="flex h-[35px] w-[217px] justify-center" aria-hidden>
          <div className="flex animate-[wax-bob_1.6s_ease-in-out_infinite] flex-col items-center motion-reduce:animate-none">
            <span className="bg-container-floating text-text-on-floating flex h-[27px] items-center rounded-[7px] px-[14px] text-[13px] leading-[18px] font-medium tracking-[-0.005em] whitespace-nowrap">
              Weeth 알아보기
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/wax/bubble-tail.svg"
              alt=""
              width={12}
              height={6}
              className="-mt-px"
            />
          </div>
        </div>
        <div className="flex justify-between gap-[10px]">
          <a
            href={weethUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-button-primary typo-button1 text-text-inverse flex w-[217px] items-center justify-center rounded-sm px-400 py-200"
          >
            누가 만들었지?
          </a>
          <form method="dialog" className="flex flex-1">
            <button className="bg-button-neutral typo-button1 text-text-strong flex-1 rounded-sm px-400 py-200">
              닫기
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
