'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import type { HomeTutorialSlide } from '@/constants/home/tutorial';
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
  slides: HomeTutorialSlide[];
  onSecondaryAction?: (action: 'open-profile-setup-modal') => void;
}

function HomeTutorialDialog({
  open,
  onOpenChange,
  slides,
  onSecondaryAction,
}: HomeTutorialDialogProps) {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const displayIndex = open ? currentIndex : 0;
  const currentSlide = slides[displayIndex];
  const showPagination = slides.length > 1;

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

  const isLastSlide = displayIndex === slides.length - 1;

  const handleSecondary = () => {
    onOpenChange(false);
    if (currentSlide.secondaryAction) {
      onSecondaryAction?.(currentSlide.secondaryAction);
      return;
    }
    if (currentSlide.secondaryHref) {
      router.push(currentSlide.secondaryHref(clubId));
    }
  };

  const handlePrevious = () => {
    api?.scrollPrev();
  };

  const handleNext = () => {
    if (isLastSlide) {
      onOpenChange(false);
      return;
    }
    api?.scrollNext();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="w-full max-w-[668px] gap-0 rounded-md p-500">
        <DialogHeader
          overline={currentSlide.overline ?? '사이트 완성하기'}
          title={currentSlide.title}
          description={currentSlide.description}
          className="min-h-27 pb-300"
        />

        <DialogBody className="gap-0 overflow-hidden rounded-sm px-0 pt-400 pb-0">
          <Carousel setApi={setApi} opts={{ watchDrag: false }}>
            <CarouselContent>
              {slides.map((slide, index) => (
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
            showPagination ? (
              <PaginationButton
                currentIndex={displayIndex}
                total={slides.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            ) : undefined
          }
        >
          <Button variant="secondary" size="lg" className="w-full" onClick={handleSecondary}>
            {currentSlide.secondaryLabel}
          </Button>
          <Button variant="primary" size="lg" className="w-full" onClick={handleNext}>
            {isLastSlide ? '닫기' : '다음'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { HomeTutorialDialog };
