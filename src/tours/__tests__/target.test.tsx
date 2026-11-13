import { render } from '@testing-library/react';
import { tourSelector, tourTarget } from '@/tours/target';

describe('tourTarget / tourSelector', () => {
  it('tourTarget이 만든 속성을 tourSelector가 찾아낸다', () => {
    const { container } = render(<div {...tourTarget('admin-warning.type-toggle')} />);

    expect(container.querySelector(tourSelector('admin-warning.type-toggle'))).not.toBeNull();
  });

  it('다른 id의 셀렉터로는 찾지 못한다', () => {
    const { container } = render(<div {...tourTarget('admin-warning.type-toggle')} />);

    expect(container.querySelector(tourSelector('admin-warning.other-step'))).toBeNull();
  });

  it('data-tour 속성값 그대로를 유지한다', () => {
    const { container } = render(<div {...tourTarget('admin-warning.type-toggle')} />);

    expect(container.firstElementChild).toHaveAttribute('data-tour', 'admin-warning.type-toggle');
  });
});
