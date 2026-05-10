'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { CloseCircleIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';
import { getActivePopup, type PopupDocument } from '@/lib/apis/popup';
import DefaultPopupImg from '@/assets/image/popup_default_img_1.png';

const HIDE_KEY = 'popup_hide_until';

function NoticePopup() {
  const [popup, setPopup] = useState<PopupDocument | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  const isHomePage = pathname?.endsWith('/home') ?? false;

  useEffect(() => {
    if (!isHomePage) return;

    const checkPopup = async () => {
      const hideUntil = localStorage.getItem(HIDE_KEY);
      if (hideUntil && new Date() < new Date(hideUntil)) return;

      try {
        const data = await getActivePopup();
        if (data?.pages?.length) {
          setPopup(data);
          setIsVisible(true);
        }
      } catch {
        // 팝업 로딩 실패 시 조용히 무시
      }
    };

    checkPopup();
  }, [isHomePage]);

  const handleClose = () => setIsVisible(false);

  const handleDismiss24h = () => {
    const hideUntil = new Date();
    hideUntil.setHours(hideUntil.getHours() + 24);
    localStorage.setItem(HIDE_KEY, hideUntil.toISOString());
    setIsVisible(false);
  };

  const handlePrev = () => setCurrentIndex((prev) => Math.max(0, prev - 1));

  const handleNext = () => {
    if (!popup) return;
    setCurrentIndex((prev) => Math.min(popup.pages.length - 1, prev + 1));
  };

  if (!isHomePage || !isVisible || !popup || popup.pages.length === 0) return null;

  const currentPage = popup.pages[currentIndex];
  const showPagination = popup.pages.length > 1;
  const headerText = popup.headerLabel || 'Weeth의 새로운 기능';

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-50 flex flex-col',
        'items-center justify-start pt-[60px]',
        'desktop:items-end desktop:justify-end desktop:p-600',
      )}
    >
      <div
        className="pointer-events-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 팝업 카드 */}
        <div
          className={cn(
            'bg-container-neutral flex w-[320px] max-w-[calc(100vw-32px)] flex-col overflow-hidden',
            'rounded-lg border border-[var(--color-line,#e5e7eb)] shadow-[0px_0px_10px_8px_rgba(0,0,0,0.3)]',
          )}
        >
          {/* 헤더 */}
          <div className="bg-container-neutral flex items-center justify-between p-450">
            <span className="typo-sub2 text-text-normal">{headerText}</span>
            <button
              onClick={handleClose}
              aria-label="닫기"
              className={cn(
                'bg-button-neutral hover:bg-button-neutral-interaction flex size-6 cursor-pointer items-center justify-center rounded-sm border-none',
              )}
            >
              <Image src={CloseCircleIcon} alt="닫기" width={16} height={16} />
            </button>
          </div>

          {/* 이미지 */}
          <div className="relative aspect-[16/10] w-full">
            <Image
              src={currentPage.useDefaultImage || !currentPage.imageUrl ? DefaultPopupImg : currentPage.imageUrl}
              alt={currentPage.title}
              fill
              className="object-cover"
            />
          </div>

          {/* 콘텐츠 */}
          <div className="flex flex-col p-400">
            <h3 className="typo-sub1 text-text-normal mb-200">{currentPage.title}</h3>
            {currentPage.content && (
              <p className="typo-body2 text-text-alternative whitespace-pre-wrap">
                {currentPage.content}
              </p>
            )}

            {showPagination && (
              <div className="mb-700 mt-400 flex items-center gap-300">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="cursor-pointer border-none bg-transparent text-[18px] text-text-normal disabled:cursor-default disabled:opacity-20"
                >
                  ‹
                </button>
                <span className="typo-caption1 text-text-normal">
                  {currentIndex + 1} / {popup.pages.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === popup.pages.length - 1}
                  className="cursor-pointer border-none bg-transparent text-[18px] text-text-normal disabled:cursor-default disabled:opacity-20"
                >
                  ›
                </button>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className={cn(
                  'typo-button1 bg-button-primary hover:bg-button-primary-interaction text-text-inverse',
                  'min-w-[120px] cursor-pointer rounded-md border-none px-500 py-300',
                )}
              >
                확인
              </button>
            </div>
          </div>
        </div>

        {/* 24시간 숨기기 */}
        <button
          onClick={handleDismiss24h}
          className="typo-button2 text-text-alternative hover:text-text-strong self-start cursor-pointer border-none bg-transparent px-450 py-200 underline underline-offset-[3px]"
        >
          24시간동안 보이지 않기
        </button>
      </div>
    </div>
  );
}

export { NoticePopup };
