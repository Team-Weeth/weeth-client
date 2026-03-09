'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon } from '@/assets/icons';

interface CalendarEvent {
  id: number;
  date: string;
  title: string;
  timeRange: string;
}

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 1,
    date: '2024년 8월 18일 (목)',
    title: '4일 일정',
    timeRange: '8월 17일 (수) 00:00 ~ 6월 20일 (토) 00:00',
  },
  {
    id: 2,
    date: '2024년 8월 18일 (목)',
    title: '4일 일정',
    timeRange: '8월 17일 (수) 00:00 ~ 6월 20일 (토) 00:00',
  },
  {
    id: 3,
    date: '2024년 8월 18일 (목)',
    title: '4일 일정',
    timeRange: '8월 17일 (수) 00:00 ~ 6월 20일 (토) 00:00',
  },
  {
    id: 4,
    date: '2024년 8월 18일 (목)',
    title: '4일 일정',
    timeRange: '8월 17일 (수) 00:00 ~ 6월 20일 (토) 00:00',
  },
];

export function CalendarBox() {
  const router = useRouter();

  return (
    <div className="bg-container-neutral rounded-lg">
      <div className="typo-sub1 text-text-strong flex justify-between p-450">
        <p className="typo-sub1 text-text-strong">8월 캘린더</p>
        <button onClick={() => router.push('/notice')}>
          <Image
            src={ArrowRightIcon}
            alt="arrow-right"
            width={16}
            height={16}
            className="cursor-pointer px-[6px] py-1"
          />
        </button>
      </div>
      <div className="flex flex-col gap-400 p-450">
        {MOCK_EVENTS.map((event) => (
          <div key={event.id} className="flex flex-col gap-200">
            <p className="typo-sub2 text-text-strong">{event.date}</p>
            <div className="bg-container-neutral-alternative flex gap-[10px] rounded-md py-[10px] pl-[5px]">
              <div className="bg-brand-primary h-[45px] w-[5px] rounded-xl" />
              <div className="flex flex-col gap-[5px]">
                <p className="typo-body1 text-text-strong">{event.title}</p>
                <p className="typo-caption2 text-text-alternative">{event.timeRange}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
