import type { PolicyData } from '@/constants/term';
import { cn } from '@/lib/cn';
import { PolicySection } from './PolicySection';

interface PolicyBodyProps {
  data: PolicyData;
  className?: string;
}

function PolicyBody({ data, className }: PolicyBodyProps) {
  return (
    <div className={cn('flex flex-col gap-600', className)}>
      <div className="typo-body2 text-text-alternative flex flex-col gap-200">
        {data.intro.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </div>

      {data.sections.map((section) => (
        <PolicySection key={section.heading} heading={section.heading}>
          {section.type === 'intro-list' && (
            <>
              <p>{section.intro}</p>
              <div>
                <p>{section.listHeading}</p>
                <ul className="mt-200 list-disc pl-500">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <p>{section.footer}</p>
            </>
          )}

          {section.type === 'list' && (
            <ul className="list-disc pl-500">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}

          {section.type === 'contact' && (
            <p>
              {section.prefix}
              <span className="text-brand-primary">{section.email}</span>
              {section.suffix}
            </p>
          )}
        </PolicySection>
      ))}
    </div>
  );
}

export { PolicyBody, type PolicyBodyProps };
