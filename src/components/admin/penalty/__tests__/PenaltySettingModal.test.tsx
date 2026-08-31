import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PenaltySettingModal } from '@/components/admin/penalty/modal/PenaltySettingModal';

const GUIDE = '페널티를 받는 기준은 아래와 같아요.';

function renderModal() {
  const onSave = jest.fn();
  const onOpenChange = jest.fn();

  render(<PenaltySettingModal open onOpenChange={onOpenChange} guide={GUIDE} onSave={onSave} />);

  return { onSave, onOpenChange, textarea: screen.getByLabelText('내용') };
}

describe('PenaltySettingModal', () => {
  it('저장된 페널티 규정을 입력값으로 보여준다', () => {
    const { textarea } = renderModal();

    expect(screen.getByRole('heading', { name: '페널티 규정 입력' })).toBeInTheDocument();
    expect(textarea).toHaveValue(GUIDE);
    expect(screen.getByText(`${GUIDE.length}/500`)).toBeInTheDocument();
  });

  it('내용을 수정하고 저장하면 수정된 규정을 전달한다', async () => {
    const user = userEvent.setup();
    const { onSave, textarea } = renderModal();

    await user.clear(textarea);
    await user.type(textarea, '경고를 2회 받았을 때');
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(onSave).toHaveBeenCalledWith('경고를 2회 받았을 때');
  });

  it('내용이 비어 있으면 저장할 수 없다', async () => {
    const user = userEvent.setup();
    const { textarea } = renderModal();

    await user.clear(textarea);

    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
  });

  it('취소를 누르면 저장하지 않고 모달을 닫는다', async () => {
    const user = userEvent.setup();
    const { onSave, onOpenChange } = renderModal();

    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(onSave).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
