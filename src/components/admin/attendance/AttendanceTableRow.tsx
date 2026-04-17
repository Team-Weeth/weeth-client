import { cn } from '@/lib/cn';

interface AttendanceTableRowProps {
  isEditing: boolean;
  position?: 'top' | 'bottom';
}

function AttendanceTableRow({ isEditing, position }: AttendanceTableRowProps) {
  return (
    <div className="flex">
      {/* left cell */}
      <div
        className={cn(
          'border-line flex h-[48px] min-w-0 flex-1 items-center border px-400 py-300',
          position === 'top' && 'rounded-tl-sm',
          position === 'bottom' && 'rounded-bl-sm',
        )}
      >
        <span className="typo-sub2 text-text-alternative">사용자 정보</span>
      </div>

      {/* right cells */}
      {isEditing ? (
        <>
          <div className="border-line flex w-[79px] items-center justify-center border px-400 py-300">
            <span className="typo-sub2 text-text-alternative">출석</span>
          </div>
          <div
            className={cn(
              'border-line flex w-[79px] items-center justify-center border px-400 py-300',
              position === 'top' && 'rounded-tr-sm',
              position === 'bottom' && 'rounded-br-sm',
            )}
          >
            <span className="typo-sub2 text-text-alternative">결석</span>
          </div>
        </>
      ) : (
        <div
          className={cn(
            'border-line flex w-[158px] items-center justify-center border px-400 py-300',
            position === 'top' && 'rounded-tr-sm',
            position === 'bottom' && 'rounded-br-sm',
          )}
        >
          <span className="typo-sub2 text-text-alternative">출석 정보</span>
        </div>
      )}
    </div>
  );
}

export { AttendanceTableRow };
