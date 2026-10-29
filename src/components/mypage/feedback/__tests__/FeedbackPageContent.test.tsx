import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { useRouter } from 'next/navigation';

import { FeedbackPageContent } from '@/components/mypage/feedback/FeedbackPageContent';
import { FEEDBACK_CONTENT_MAX_LENGTH } from '@/constants/feedback';
import { DEFAULT_CLUB_FEATURES } from '@/flags/club-features/definitions';
import { trackFeedbackOpened } from '@/lib/analytics/feedbackEvents';
import { server } from '@/mocks/server';
import { ClubFeatureProvider } from '@/providers/club-feature-provider';
import { toastError } from '@/stores/useToastStore';
import { createQueryClient, createWrapper } from '@/test-utils/query';
import type { CreateFeedbackRequest } from '@/types/feedback';

jest.mock('@/stores/useClubStore', () => ({ useClubId: () => 'club-1' }));
jest.mock('@/stores/useToastStore', () => ({
  ...jest.requireActual('@/stores/useToastStore'),
  toastError: jest.fn(),
}));
jest.mock('@/lib/analytics/feedbackEvents', () => ({
  ...jest.requireActual('@/lib/analytics/feedbackEvents'),
  trackFeedbackOpened: jest.fn(),
  trackFeedbackSubmitted: jest.fn(),
}));

const FEEDBACK_URL = '/api/proxy/clubs/:clubId/feedbacks';

function renderPage() {
  const QueryWrapper = createWrapper(createQueryClient());
  const user = userEvent.setup();
  render(
    <QueryWrapper>
      <ClubFeatureProvider features={DEFAULT_CLUB_FEATURES}>
        <FeedbackPageContent />
      </ClubFeatureProvider>
    </QueryWrapper>,
  );
  return { user };
}

function getTextarea() {
  return screen.getByRole('textbox', { name: '서비스 피드백 내용' });
}

function getSubmitButton() {
  return screen.getByRole('button', { name: '전송' });
}

function captureRequestBody() {
  const bodies: CreateFeedbackRequest[] = [];
  server.use(
    http.post(FEEDBACK_URL, async ({ request }) => {
      bodies.push((await request.json()) as CreateFeedbackRequest);
      return HttpResponse.json({ code: 11500, message: '피드백이 등록되었습니다.', data: null });
    }),
  );
  return bodies;
}

describe('FeedbackPageContent', () => {
  it('제목·안내 문구와 입력창을 보여주고 화면 노출 이벤트를 남긴다', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: '서비스 피드백' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Weeth에 바라는 점이 있나요?' }),
    ).toBeInTheDocument();
    expect(getTextarea()).toHaveAttribute('placeholder', '의견을 자유롭게 남겨주세요.');
    expect(getTextarea()).toHaveAttribute('maxLength', String(FEEDBACK_CONTENT_MAX_LENGTH));
    expect(screen.getByText(`0/${FEEDBACK_CONTENT_MAX_LENGTH}`)).toBeInTheDocument();
    expect(trackFeedbackOpened).toHaveBeenCalledWith({
      variant: 'settings',
      clubId: 'test-club-id',
    });
  });

  it('뒤로가기를 누르면 서비스 설정으로 이동한다', async () => {
    const { user } = renderPage();

    await user.click(screen.getByRole('button', { name: '서비스 설정으로 돌아가기' }));

    expect(useRouter().push).toHaveBeenCalledWith('/test-club-id/mypage/settings');
  });

  describe('전송 버튼 활성화', () => {
    it('입력이 비어 있으면 비활성화된다', () => {
      renderPage();

      expect(getSubmitButton()).toBeDisabled();
    });

    it.each([
      ['일반 공백', '   '],
      ['줄바꿈', '\n\n'],
      ['전각 공백(U+3000)', '\u3000\u3000'],
      ['줄바꿈 없는 공백(U+00A0)', '\u00a0'],
    ])('%s만 입력하면 비활성화된다', async (_, whitespace) => {
      const { user } = renderPage();

      await user.type(getTextarea(), whitespace);

      expect(getSubmitButton()).toBeDisabled();
    });

    it('내용을 입력하면 활성화되고 글자 수가 갱신된다', async () => {
      const { user } = renderPage();

      await user.type(getTextarea(), '좋아요');

      expect(getSubmitButton()).toBeEnabled();
      expect(screen.getByText(`3/${FEEDBACK_CONTENT_MAX_LENGTH}`)).toBeInTheDocument();
    });
  });

  it('전송에 성공하면 FORM 채널로 등록하고 완료 화면을 보여준다', async () => {
    const bodies = captureRequestBody();
    const { user } = renderPage();

    await user.type(getTextarea(), '  다크 모드가 더 어두웠으면 해요  ');
    await user.click(getSubmitButton());

    expect(await screen.findByText('피드백이 전달됐어요!')).toBeInTheDocument();
    expect(screen.getByText('소중한 의견 감사합니다.')).toBeInTheDocument();
    expect(bodies).toEqual([{ content: '다크 모드가 더 어두웠으면 해요', channel: 'FORM' }]);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('새로 작성하기를 누르면 빈 폼으로 돌아간다', async () => {
    captureRequestBody();
    const { user } = renderPage();

    await user.type(getTextarea(), '알림 설정이 필요해요');
    await user.click(getSubmitButton());
    await user.click(await screen.findByRole('button', { name: '새로 작성하기' }));

    expect(getTextarea()).toHaveValue('');
    expect(getSubmitButton()).toBeDisabled();
  });

  describe('전송 실패', () => {
    it('서버 메시지를 토스트로 보여주고 입력한 내용을 유지한다', async () => {
      server.use(
        http.post(FEEDBACK_URL, () =>
          HttpResponse.json(
            { code: 21500, message: '피드백 내용을 입력해주세요.', data: null },
            { status: 400 },
          ),
        ),
      );
      const { user } = renderPage();

      await user.type(getTextarea(), '저장 안 되는 피드백');
      await user.click(getSubmitButton());

      await waitFor(() => expect(toastError).toHaveBeenCalledWith('피드백 내용을 입력해주세요.'));
      expect(getTextarea()).toHaveValue('저장 안 되는 피드백');
      expect(screen.queryByText('피드백이 전달됐어요!')).not.toBeInTheDocument();
    });

    it('검증 실패(bindException)는 필드 사유를 토스트로 보여준다', async () => {
      server.use(
        http.post(FEEDBACK_URL, () =>
          HttpResponse.json(
            {
              code: 400,
              message: 'bindException',
              data: [{ message: '피드백 내용은 1자 이상 1000자 이하로 입력해주세요.', value: '' }],
            },
            { status: 400 },
          ),
        ),
      );
      const { user } = renderPage();

      await user.type(getTextarea(), '검증 실패');
      await user.click(getSubmitButton());

      await waitFor(() =>
        expect(toastError).toHaveBeenCalledWith(
          '피드백 내용은 1자 이상 1000자 이하로 입력해주세요.',
        ),
      );
      expect(getTextarea()).toHaveValue('검증 실패');
    });
  });
});
