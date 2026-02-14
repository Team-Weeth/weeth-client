'use client';

import { Button } from '@/components/ui';
import { useThemeStore } from '@/stores/theme-store';

function Row({ label, className }: { label: string; className: string }) {
  return <div className={`typo-body2 px-3 py-1 ${className}`}>{label}</div>;
}

export default function LandingPage() {
  const { isDark, toggle } = useThemeStore();

  return (
    <div className="bg-background min-h-screen p-400">
      <Button variant="secondary" size="lg" onClick={toggle}>
        {isDark ? '☀️ 라이트모드' : '🌙 다크모드'}
      </Button>

      <p className="typo-caption1 text-text-disabled mb-2">TYPOGRAPHY</p>
      <div className="typo-h1 text-text-strong">H1 Weeth</div>
      <div className="typo-h2 text-text-strong">H2 Weeth</div>
      <div className="typo-h3 text-text-strong">H3 Weeth</div>
      <div className="typo-sub1 text-text-normal">Sub1 Weeth</div>
      <div className="typo-sub2 text-text-normal">Sub2 Weeth</div>
      <div className="typo-body1 text-text-normal">Body1 Weeth</div>
      <div className="typo-body2 text-text-normal">Body2 Weeth</div>
      <div className="typo-caption1 text-text-alternative">Caption1 Weeth</div>
      <div className="typo-caption2 text-text-alternative">Caption2 Weeth</div>
      <div className="typo-button1 text-text-normal">Button1 Weeth</div>
      <div className="typo-button2 text-text-normal">Button2 Weeth</div>

      <p className="typo-caption1 text-text-disabled mt-6 mb-2">TEXT</p>
      <div className="flex flex-col gap-1">
        <Row label="text-normal" className="text-text-normal" />
        <Row label="text-strong" className="text-text-strong" />
        <Row label="text-alternative" className="text-text-alternative" />
        <Row label="text-disabled" className="text-text-disabled" />
        <Row label="text-inverse" className="bg-text-normal text-text-inverse" />
      </div>

      <p className="typo-caption1 text-text-disabled mt-6 mb-2">BACKGROUND</p>
      <div className="flex flex-col gap-1">
        <Row label="background" className="border-line bg-background text-text-normal border" />
        <Row label="line" className="bg-line text-text-inverse" />
      </div>

      <p className="typo-caption1 text-text-disabled mt-6 mb-2">CONTAINER</p>
      <div className="flex flex-col gap-1">
        <Row label="container-neutral" className="bg-container-neutral text-text-normal" />
        <Row
          label="container-neutral-interaction"
          className="bg-container-neutral-interaction text-text-normal"
        />
        <Row
          label="container-neutral-alternative"
          className="bg-container-neutral-alternative text-text-normal"
        />
        <Row label="container-primary" className="bg-container-primary text-text-inverse" />
        <Row
          label="container-primary-interaction"
          className="bg-container-primary-interaction text-text-inverse"
        />
        <Row
          label="container-primary-alternative"
          className="bg-container-primary-alternative text-text-normal"
        />
        <Row label="container-secondary" className="bg-container-secondary text-text-inverse" />
        <Row
          label="container-secondary-interaction"
          className="bg-container-secondary-interaction text-text-inverse"
        />
        <Row
          label="container-secondary-alternative"
          className="bg-container-secondary-alternative text-text-normal"
        />
      </div>

      <p className="typo-caption1 text-text-disabled mt-6 mb-2">BUTTON</p>
      <div className="flex flex-col gap-1">
        <Row label="button-neutral" className="bg-button-neutral text-text-normal" />
        <Row
          label="button-neutral-interaction"
          className="bg-button-neutral-interaction text-text-normal"
        />
        <Row label="button-primary" className="bg-button-primary text-text-inverse" />
        <Row
          label="button-primary-interaction"
          className="bg-button-primary-interaction text-text-inverse"
        />
      </div>

      <p className="typo-caption1 text-text-disabled mt-6 mb-2">ICON</p>
      <div className="flex flex-col gap-1">
        <Row label="icon-normal" className="text-icon-normal" />
        <Row label="icon-strong" className="text-icon-strong" />
        <Row label="icon-alternative" className="text-icon-alternative" />
        <Row label="icon-disabled" className="text-icon-disabled" />
        <Row label="icon-inverse" className="bg-icon-normal text-icon-inverse" />
      </div>

      <p className="typo-caption1 text-text-disabled mt-6 mb-2">BRAND</p>
      <div className="flex flex-col gap-1">
        <Row label="brand-primary" className="text-brand-primary" />
        <Row label="brand-secondary" className="text-brand-secondary" />
        <Row label="brand-purple" className="text-brand-purple" />
        <Row label="brand-pink" className="text-brand-pink" />
      </div>

      <p className="typo-caption1 text-text-disabled mt-6 mb-2">STATE</p>
      <div className="flex flex-col gap-1">
        <Row label="state-success" className="text-state-success" />
        <Row label="state-caution" className="text-state-caution" />
        <Row label="state-error" className="text-state-error" />
      </div>
    </div>
  );
}
