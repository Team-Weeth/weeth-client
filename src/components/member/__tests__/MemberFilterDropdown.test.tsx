import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberFilterDropdown } from '@/components/member/MemberFilterDropdown';

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      onchange: null,
      dispatchEvent: jest.fn(),
    })),
  });
}

const options = [
  { value: 'PLANNING', label: '기획' },
  { value: 'DESIGN', label: '디자인' },
];

describe('MemberFilterDropdown 적용 버튼 disabled 상태', () => {
  it('데스크톱: 선택을 변경하지 않으면 적용 버튼이 disabled 상태다', async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();
    render(
      <MemberFilterDropdown label="포지션" options={options} selected={[]} onApply={jest.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: '포지션' }));

    expect(screen.getByRole('button', { name: '적용' })).toBeDisabled();
  });

  it('데스크톱: 선택을 변경하면 적용 버튼이 활성화된다', async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();
    render(
      <MemberFilterDropdown label="포지션" options={options} selected={[]} onApply={jest.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: '포지션' }));
    await user.click(screen.getByRole('button', { name: '기획' }));

    expect(screen.getByRole('button', { name: '적용' })).toBeEnabled();
  });

  it('데스크톱: 기존 선택값과 동일하게 되돌리면 다시 disabled 상태가 된다', async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();
    render(
      <MemberFilterDropdown
        label="포지션"
        options={options}
        selected={['DESIGN']}
        onApply={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: '디자인' }));
    await user.click(screen.getByRole('button', { name: '기획' }));
    await user.click(screen.getByRole('button', { name: '기획' }));

    expect(screen.getByRole('button', { name: '적용' })).toBeDisabled();
  });

  it('모바일: 선택을 변경하지 않으면 확인 버튼이 disabled 상태다', async () => {
    mockMatchMedia(true);
    const user = userEvent.setup();
    render(
      <MemberFilterDropdown
        label="포지션"
        options={options}
        selected={['DESIGN']}
        onApply={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: '디자인' }));

    expect(screen.getByRole('button', { name: '확인' })).toBeDisabled();
  });
});
