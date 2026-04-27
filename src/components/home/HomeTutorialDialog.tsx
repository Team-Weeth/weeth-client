'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import { HOME_TUTORIAL_SLIDES } from '@/constants/home/tutorial';
import {
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  type CarouselApi,
} from '@/components/ui';
import { PaginationButton } from './PaginationButton';

interface HomeTutorialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function HomeTutorialDialog({ open, onOpenChange }: HomeTutorialDialogProps) {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const displayIndex = open ? currentIndex : 0;
  const currentSlide = HOME_TUTORIAL_SLIDES[displayIndex];

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!open) {
      api?.scrollTo(0, true);
    }
  }, [open, api]);

  const handleGoToAdmin = () => {
    onOpenChange(false);
    router.push(`/${clubId}/admin`);
  };

  const handlePrevious = () => {
    api?.scrollPrev();
  };

  const handleNext = () => {
    if (displayIndex === HOME_TUTORIAL_SLIDES.length - 1) {
      onOpenChange(false);
      return;
    }
    api?.scrollNext();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="w-full max-w-[668px] gap-0 rounded-md p-500">
        <DialogHeader
          overline="사이트 완성하기"
          title={currentSlide.title}
          description={currentSlide.description}
          titleClassName="typo-sub1"
          className="min-h-27 pb-300"
        />

        <DialogBody className="gap-0 overflow-hidden rounded-sm px-0 pt-400 pb-0">
          <Carousel setApi={setApi} opts={{ watchDrag: false }}>
            <CarouselContent>
              {HOME_TUTORIAL_SLIDES.map((slide, index) => (
                <CarouselItem key={index}>
                  <Image
                    src={slide.image}
                    alt="홈 온보딩 예시 화면"
                    className="h-auto w-full rounded-sm"
                    priority={index === 0}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </DialogBody>

        <DialogFooter
          showDivider
          className="gap-2.5 pt-400"
          pagination={
            <PaginationButton
              currentIndex={displayIndex}
              total={HOME_TUTORIAL_SLIDES.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />
          }
        >
          <Button variant="secondary" size="lg" className="w-full" onClick={handleGoToAdmin}>
            설정하러 가기
          </Button>
          <Button variant="primary" size="lg" className="w-full" onClick={handleNext}>
            {displayIndex === HOME_TUTORIAL_SLIDES.length - 1 ? '닫기' : '다음'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { HomeTutorialDialog };
