import { cn } from '@/lib/cn';

interface AttendanceTableRowProps {
  isEditing: boolean;
  position?: 'top' | 'bottom';
}

function AttendanceTableRow({ isEditing, position }: AttendanceTableRowProps) {
  return (
    <div className="flex">
      <div
        className={cn(
          'border-line flex h-[48px] min-w-0 flex-1 items-center border px-400 py-300',
          position === 'top' && 'rounded-tl-sm',
          position === 'bottom' && 'rounded-bl-sm',
        )}
      >
        <span className="typo-sub2 text-text-alternative">사용자 정보</span>
      </div>

      {isEditing ? (
        <>
          <div className="border-line flex w-[79px] items-center justify-center border px-400 py-300">
            출석
          </div>
          <div
            className={cn(
              'border-line flex w-[79px] items-center justify-center border px-400 py-300',
              position === 'top' && 'rounded-tr-sm',
              position === 'bottom' && 'rounded-br-sm',
            )}
          >
            결석
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
          출석 정보
        </div>
      )}
    </div>
  );
}

export default AttendanceTableRow;
