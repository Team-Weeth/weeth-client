import type { PolicyData } from '@/constants/term';
import { cn } from '@/lib/cn';
import { PolicySection } from './PolicySection';

interface PolicyBodyProps {
  data: PolicyData;
  className?: string;
}

type LegacySection =
  | {
      heading: string;
      type: 'list';
      items: string[];
    }
  | {
      heading: string;
      type: 'intro-list';
      intro: string;
      listHeading: string;
      items: string[];
      footer: string;
    }
  | {
      heading: string;
      type: 'contact';
      prefix: string;
      email: string;
      suffix: string;
    };

type CompatibleSection = PolicyData['sections'][number] | LegacySection;

function hasBlocks(section: CompatibleSection): section is PolicyData['sections'][number] {
  return 'blocks' in section && Array.isArray(section.blocks);
}

function isLegacyIntroListSection(
  section: CompatibleSection,
): section is Extract<LegacySection, { type: 'intro-list' }> {
  return 'type' in section && section.type === 'intro-list';
}

function isLegacyContactSection(
  section: CompatibleSection,
): section is Extract<LegacySection, { type: 'contact' }> {
  return 'type' in section && section.type === 'contact';
}

function isLegacyListSection(
  section: CompatibleSection,
): section is Extract<LegacySection, { type: 'list' }> {
  return 'type' in section && section.type === 'list';
}

function getSectionBlocks(section: CompatibleSection) {
  if (hasBlocks(section)) {
    return section.blocks;
  }

  if (isLegacyIntroListSection(section)) {
    return [
      { type: 'paragraph' as const, text: section.intro },
      { type: 'paragraph' as const, text: section.listHeading },
      { type: 'list' as const, items: section.items, ordered: false },
      { type: 'paragraph' as const, text: section.footer },
    ];
  }

  if (isLegacyContactSection(section)) {
    return [
      {
        type: 'contact' as const,
        prefix: section.prefix,
        email: section.email,
        suffix: section.suffix,
      },
    ];
  }

  if (isLegacyListSection(section)) {
    return [{ type: 'list' as const, items: section.items, ordered: false }];
  }

  return [];
}

function PolicyBody({ data, className }: PolicyBodyProps) {
  return (
    <div className={cn('flex flex-col gap-600', className)}>
      <div className="typo-body2 text-text-alternative flex flex-col gap-200">
        {data.intro.map((text) => (
          <p key={text}>{text}</p>
        ))}
      </div>

      {(data.sections as CompatibleSection[]).map((section) => (
        <PolicySection key={section.heading} heading={section.heading}>
          {getSectionBlocks(section).map((block, index) => {
            if (block.type === 'paragraph') {
              return <p key={`${section.heading}-${index}`}>{block.text}</p>;
            }

            if (block.type === 'contact') {
              return (
                <p key={`${section.heading}-${index}`}>
                  {block.prefix}
                  <a href={`mailto:${block.email}`} className="text-brand-primary">
                    {block.email}
                  </a>
                  {block.suffix}
                </p>
              );
            }

            const ListTag = block.ordered ? 'ol' : 'ul';

            return (
              <ListTag
                key={`${section.heading}-${index}`}
                className={cn(block.ordered ? 'list-decimal' : 'list-disc', 'pl-500')}
              >
                {block.items.map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ListTag>
            );
          })}
        </PolicySection>
      ))}
    </div>
  );
}

export { PolicyBody, type PolicyBodyProps };
