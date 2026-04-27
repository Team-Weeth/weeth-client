import { cn } from '@/lib/cn';

interface AttendanceTableRowProps {
  isEditing: boolean;
  position?: 'top' | 'bottom';
}

function AttendanceTableRow({ isEditing, position }: AttendanceTableRowProps) {
  const isTop = position === 'top';
  const isBottom = position === 'bottom';

  return (
    <div className="flex">
      {/* left cell */}
      <div
        className={cn(
          'border-line flex h-[48px] min-w-0 flex-1 items-center border-r border-b border-l px-400 py-300',
          isTop && 'rounded-tl-sm border-t',
          isBottom && 'rounded-bl-sm',
        )}
      >
        <span className="typo-sub3 text-text-alternative">사용자 정보</span>
      </div>

      {/* right cells */}
      {isEditing ? (
        <>
          <div
            className={cn(
              'border-line flex w-[79px] items-center justify-center border-r border-b px-400 py-300',
              isTop && 'border-t',
            )}
          >
            <span className="typo-sub3 text-text-alternative">출석</span>
          </div>
          <div
            className={cn(
              'border-line flex w-[79px] items-center justify-center border-r border-b px-400 py-300',
              isTop && 'rounded-tr-sm border-t',
              isBottom && 'rounded-br-sm',
            )}
          >
            <span className="typo-sub3 text-text-alternative">결석</span>
          </div>
        </>
      ) : (
        <div
          className={cn(
            'border-line flex w-[158px] items-center justify-center border-r border-b px-400 py-300',
            isTop && 'rounded-tr-sm border-t',
            isBottom && 'rounded-br-sm',
          )}
        >
          <span className="typo-sub3 text-text-alternative">출석 정보</span>
        </div>
      )}
    </div>
  );
}

export { AttendanceTableRow };
