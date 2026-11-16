const WEETH_URL =
  'https://www.weeth.kr/landing?utm_source=wax&utm_medium=minigame&utm_campaign=paused';

/** 운영 스위치(Flagsmith `wax_enabled`)가 꺼졌을 때 게임 대신 보여주는 화면. */
export function WaxPaused() {
  return (
    <main
      className="from-primary-100 to-container-neutral-alternative fixed inset-0 grid place-items-center bg-gradient-to-b p-400"
      data-testid="wax-paused"
    >
      <div className="border-line bg-container-neutral/85 flex w-full max-w-[440px] flex-col gap-400 rounded-lg border p-600 text-center shadow-lg backdrop-blur-md">
        <p className="typo-caption1 text-primary-600">WEETH 미니게임</p>
        <h1 className="typo-h2 text-text-strong">교수님 몰래 왁뿌볼</h1>
        <p className="typo-body2 text-text-normal">
          지금은 쉬는 시간이에요. 교실을 정비하고 있으니 잠시 후 다시 와주세요.
        </p>
        <a
          href={WEETH_URL}
          className="bg-button-neutral typo-button1 text-text-normal rounded-md py-300"
        >
          Weeth 알아보기
        </a>
      </div>
    </main>
  );
}
