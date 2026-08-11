import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { cn } from '@/lib/cn';

interface PolicyContentProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

function PolicyContent({ title, className, children }: PolicyContentProps) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-[1025px] flex-col gap-600 px-450 pt-600 pb-[80px]',
        className,
      )}
    >
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="typo-caption1 text-text-alternative">
              서비스 정책
            </BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="typo-caption1 text-text-alternative">{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Content */}
      <div className="flex flex-col gap-600">
        <h1 className="typo-h3 text-text-strong">{title}</h1>
        <div className="flex flex-col gap-600">{children}</div>
      </div>
    </div>
  );
}

export { PolicyContent, type PolicyContentProps };
