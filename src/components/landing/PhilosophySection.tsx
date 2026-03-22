import { cn } from '@/lib/cn';

const galleryColors = [
  'bg-brand-primary',
  'bg-brand-secondary',
  'bg-container-neutral-interaction',
  'bg-container-primary-alternative',
  'bg-container-secondary-alternative',
  'bg-brand-purple',
];

function PhilosophySection() {
  return (
    <section className="w-full bg-white">
      <p className="mx-auto mt-[176px] mb-[104px] max-w-[1119px] font-[family-name:var(--font-inter)] text-[24px] leading-[160%] font-bold tracking-[-0.5%] text-[#B0B0B0]">
        <span className="text-[#434343]">
          동아리를 운영하다 세션 준비와 출석 관리, 공지 정리에 많은 시간을 쓰게 됩니다.
        </span>{' '}
        그러다 보면 정작 동아리원과 <br />
        함께 웃고 이야기할 시간은 조금씩 줄어들기도 합니다. 우리는 운영이 사람보다 앞서지 않았으면
        했습니다. 동아리
        <br />
        원이 중심이 되는 구조, 그 시간을 다시 사람에게 돌려주는 방식. Weeth는 그 고민을 해결해나가고
        있습니다.
      </p>

      <div className="h-[92px]" />
      <div className="h-[505px] overflow-hidden">
        <div className="flex h-full animate-[gallery-scroll_30s_linear_infinite] items-center gap-[14px] pl-[18px]">
          {[...galleryColors, ...galleryColors].map((color, i) => (
            <div
              key={i}
              className={cn(
                'h-[391px] w-[269px] flex-shrink-0',
                color,
                i % 3 === 0 && 'self-center',
                i % 3 === 1 && 'self-start',
                i % 3 === 2 && 'self-end',
              )}
            />
          ))}
        </div>
      </div>
      <div className="h-[135px]" />
    </section>
  );
}

export { PhilosophySection };
