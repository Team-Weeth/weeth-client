import { TableCell } from '@/components/ui/table';
import { cn } from '@/lib/cn';

interface TableTextCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  /** 태블릿 이하에서 행 높이를 줄인다 (멤버 표는 모바일 레이아웃을 지원한다) */
  responsive?: boolean;
}

/** 어드민 표의 한 줄 텍스트 셀. 넘치는 값은 말줄임 처리한다. */
function TableTextCell({ className, responsive = false, children, ...props }: TableTextCellProps) {
  return (
    <TableCell
      className={cn(
        'h-16 p-0 px-400 py-300',
        responsive && 'max-tablet:h-12 max-tablet:px-300 max-tablet:py-100',
        className,
      )}
      {...props}
    >
      <span className="typo-body2 text-text-strong block truncate">{children}</span>
    </TableCell>
  );
}

export { TableTextCell, type TableTextCellProps };
