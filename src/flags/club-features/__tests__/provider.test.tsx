import { render, screen } from '@testing-library/react';
import { ClubFeatureProvider, useClubFeatures } from '@/providers/club-feature-provider';

function WarningFeature() {
  const { warningEnabled } = useClubFeatures();
  return <span>{warningEnabled ? '경고 ON' : '경고 OFF'}</span>;
}

it('defaults to OFF outside a provider', () => {
  render(<WarningFeature />);
  expect(screen.getByText('경고 OFF')).toBeInTheDocument();
});

it('reads the current club snapshot through intermediate components and updates on switch', () => {
  const content = (
    <section>
      <div>
        <WarningFeature />
      </div>
    </section>
  );
  const { rerender } = render(
    <ClubFeatureProvider features={{ warningEnabled: true }}>{content}</ClubFeatureProvider>,
  );
  expect(screen.getByText('경고 ON')).toBeInTheDocument();
  rerender(
    <ClubFeatureProvider features={{ warningEnabled: false }}>{content}</ClubFeatureProvider>,
  );
  expect(screen.getByText('경고 OFF')).toBeInTheDocument();
});
