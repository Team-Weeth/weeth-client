import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { useParams } from 'next/navigation';
import { FeedbackFab } from '@/components/feedback/FeedbackFab';
import { FEEDBACK_CHAT_THANKS_MESSAGES, FEEDBACK_CONTENT_MAX_LENGTH } from '@/constants/feedback';
import { DEFAULT_CLUB_FEATURES } from '@/flags/club-features/definitions';
import { trackFeedbackEntryClicked, trackFeedbackOpened } from '@/lib/analytics/feedbackEvents';
import { server } from '@/mocks/server';
import { ClubFeatureProvider } from '@/providers/club-feature-provider';
import { useClubStore } from '@/stores/useClubStore';
import { useFeedbackChatStore } from '@/stores/useFeedbackChatStore';
import { mockMatchMedia } from '@/test-utils/browser';
import { createQueryClient, createWrapper } from '@/test-utils/query';
import type { HomeDashboard } from '@/types/home';

const FEEDBACK_URL = '/api/proxy/clubs/:clubId/feedbacks';
const CLUB_ID = 'test-club-id';

jest.mock('@/hooks/home/useHomeQuery', () => ({
  useHomeQuery: ({ select }: { select?: (data: HomeDashboard) => unknown } = {}) => {
    const dashboard = { myInfo: { userInfo: { role: 'USER' } } } as HomeDashboard;
    return { data: select ? select(dashboard) : dashboard };
  },
}));
jest.mock('@/lib/analytics/feedbackEvents', () => ({
  ...jest.requireActual('@/lib/analytics/feedbackEvents'),
  trackFeedbackEntryClicked: jest.fn(),
  trackFeedbackOpened: jest.fn(),
}));

function renderFab() {
  const QueryWrapper = createWrapper(createQueryClient());
  return render(
    <QueryWrapper>
      <ClubFeatureProvider features={{ ...DEFAULT_CLUB_FEATURES, feedbackFabEnabled: true }}>
        <FeedbackFab />
      </ClubFeatureProvider>
    </QueryWrapper>,
  );
}

function switchClub(clubId: string) {
  jest.mocked(useParams).mockReturnValue({ clubId });
  useClubStore.setState({ clubId });
}

/** 피드백 요청 본문을 기록하고, failTimes 횟수만큼은 서버 오류로 응답한다. */
function interceptFeedbackRequests({ failTimes = 0 } = {}) {
  const bodies: unknown[] = [];
  server.use(
    http.post(FEEDBACK_URL, async ({ request }) => {
      bodies.push(await request.json());
      if (bodies.length <= failTimes) {
        return HttpResponse.json({ code: 500, message: 'error', data: null }, { status: 500 });
      }
      return HttpResponse.json({ code: 11500, message: '피드백이 등록되었습니다.', data: null });
    }),
  );
  return bodies;
}

async function openFeedbackChat(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Weeth 메뉴' }));
  await user.click(screen.getByRole('menuitem', { name: '서비스 피드백' }));
  return screen.findByRole('dialog', { name: '서비스 피드백' });
}

beforeEach(() => {
  mockMatchMedia(false);
  switchClub(CLUB_ID);
  useFeedbackChatStore.getState().reset();
});

describe('채팅형 서비스 피드백', () => {
  it('서비스 피드백을 고르면 첫 인사가 있는 채팅 패널을 열고 입력창에 포커스한다', async () => {
    const user = userEvent.setup();
    renderFab();

    const dialog = await openFeedbackChat(user);

    expect(within(dialog).getByText('Weeth에 바라는 점이 있나요?')).toBeInTheDocument();
    expect(within(dialog).getByRole('textbox', { name: '서비스 피드백 입력' })).toHaveFocus();
  });

  it('진입 클릭과 패널 열림을 A안 그룹으로 측정한다', async () => {
    const user = userEvent.setup();
    renderFab();

    await openFeedbackChat(user);

    expect(trackFeedbackEntryClicked).toHaveBeenCalledWith({ variant: 'fab', clubId: CLUB_ID });
    expect(trackFeedbackOpened).toHaveBeenCalledWith({ variant: 'fab', clubId: CLUB_ID });
  });

  it('Escape로 패널을 닫는다', async () => {
    const user = userEvent.setup();
    renderFab();
    await openFeedbackChat(user);

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  describe('전송', () => {
    it('보내기를 누르면 CHAT 채널로 등록하고 내 말풍선 뒤에 감사 답장을 붙인다', async () => {
      const user = userEvent.setup();
      const bodies = interceptFeedbackRequests();
      renderFab();
      const dialog = await openFeedbackChat(user);
      const input = within(dialog).getByRole('textbox', { name: '서비스 피드백 입력' });

      await user.type(input, '  알림이 늦게 와요  ');
      await user.click(within(dialog).getByRole('button', { name: '보내기' }));

      const log = within(dialog).getByRole('log');
      expect(within(log).getByText('알림이 늦게 와요')).toBeInTheDocument();
      expect(input).toHaveValue('');
      expect(
        await within(log).findByText(
          (_, element) =>
            element?.textContent === FEEDBACK_CHAT_THANKS_MESSAGES[0] && element.tagName === 'P',
        ),
      ).toBeInTheDocument();
      expect(bodies).toEqual([{ content: '알림이 늦게 와요', channel: 'CHAT' }]);
    });

    it('전송에 성공할 때마다 감사 답장 문구를 돌려 쓴다', async () => {
      const user = userEvent.setup();
      interceptFeedbackRequests();
      renderFab();
      const dialog = await openFeedbackChat(user);
      const input = within(dialog).getByRole('textbox', { name: '서비스 피드백 입력' });

      await user.type(input, '첫 번째{Enter}');
      await within(dialog).findByText(/소중한 의견 감사합니다/);
      await user.type(input, '두 번째{Enter}');

      await waitFor(() =>
        expect(useFeedbackChatStore.getState().conversations[CLUB_ID]).toEqual([
          expect.objectContaining({ content: '첫 번째', status: 'sent' }),
          expect.objectContaining({ role: 'reply', content: FEEDBACK_CHAT_THANKS_MESSAGES[0] }),
          expect.objectContaining({ content: '두 번째', status: 'sent' }),
          expect.objectContaining({ role: 'reply', content: FEEDBACK_CHAT_THANKS_MESSAGES[1] }),
        ]),
      );
    });

    it('실패한 메시지만 다시 보내기를 보여주고, 누르면 같은 내용을 재전송한다', async () => {
      const user = userEvent.setup();
      const bodies = interceptFeedbackRequests({ failTimes: 1 });
      renderFab();
      const dialog = await openFeedbackChat(user);

      await user.type(
        within(dialog).getByRole('textbox', { name: '서비스 피드백 입력' }),
        '버튼이 안 눌려요{Enter}',
      );

      expect(await within(dialog).findByText('전송 실패')).toBeInTheDocument();
      expect(within(dialog).getAllByRole('button', { name: '다시 보내기' })).toHaveLength(1);
      expect(within(dialog).queryByText(/소중한 의견 감사합니다/)).not.toBeInTheDocument();

      await user.click(within(dialog).getByRole('button', { name: '다시 보내기' }));

      expect(await within(dialog).findByText(/소중한 의견 감사합니다/)).toBeInTheDocument();
      expect(within(dialog).queryByText('전송 실패')).not.toBeInTheDocument();
      expect(within(dialog).queryByRole('button', { name: '다시 보내기' })).not.toBeInTheDocument();
      expect(bodies).toEqual([
        { content: '버튼이 안 눌려요', channel: 'CHAT' },
        { content: '버튼이 안 눌려요', channel: 'CHAT' },
      ]);
    });
  });

  describe('입력', () => {
    it.each([
      ['빈 입력', ''],
      ['공백만 입력', '   '],
      ['전각·줄바꿈 없는 공백만 입력', '\u3000\u00a0'],
    ])('%s이면 보내기 버튼을 비활성화한다', async (_, text) => {
      const user = userEvent.setup();
      renderFab();
      const dialog = await openFeedbackChat(user);

      if (text) {
        await user.type(within(dialog).getByRole('textbox', { name: '서비스 피드백 입력' }), text);
      }

      expect(within(dialog).getByRole('button', { name: '보내기' })).toBeDisabled();
    });

    it('Shift+Enter는 줄바꿈만 하고 보내지 않는다', async () => {
      const user = userEvent.setup();
      const bodies = interceptFeedbackRequests();
      renderFab();
      const dialog = await openFeedbackChat(user);
      const input = within(dialog).getByRole('textbox', { name: '서비스 피드백 입력' });

      await user.type(input, '첫 줄{Shift>}{Enter}{/Shift}둘째 줄');

      expect(input).toHaveValue('첫 줄\n둘째 줄');
      expect(bodies).toHaveLength(0);
      expect(useFeedbackChatStore.getState().conversations[CLUB_ID]).toBeUndefined();
    });

    it.each([
      ['isComposing', { isComposing: true }],
      ['keyCode 229', { keyCode: 229 }],
    ])('한글 조합 중 Enter(%s)는 보내지 않는다', async (_, composingInit) => {
      const user = userEvent.setup();
      renderFab();
      const dialog = await openFeedbackChat(user);
      const input = within(dialog).getByRole('textbox', { name: '서비스 피드백 입력' });
      await user.type(input, '안녕');

      // user-event는 IME 조합 상태(isComposing·keyCode)를 지정할 수 없어 브라우저가 보내는 keydown을 직접 발생시킨다.
      act(() => {
        input.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, ...composingInit }),
        );
      });

      expect(useFeedbackChatStore.getState().conversations[CLUB_ID]).toBeUndefined();
      expect(input).toHaveValue('안녕');
    });

    it('입력을 최대 글자 수로 제한한다', async () => {
      const user = userEvent.setup();
      renderFab();
      const dialog = await openFeedbackChat(user);

      expect(within(dialog).getByRole('textbox', { name: '서비스 피드백 입력' })).toHaveAttribute(
        'maxLength',
        String(FEEDBACK_CONTENT_MAX_LENGTH),
      );
    });
  });

  describe('대화 유지', () => {
    it('패널을 닫았다 다시 열어도 대화가 남아 있다', async () => {
      const user = userEvent.setup();
      interceptFeedbackRequests();
      renderFab();
      let dialog = await openFeedbackChat(user);
      await user.type(
        within(dialog).getByRole('textbox', { name: '서비스 피드백 입력' }),
        '다크모드 좋아요{Enter}',
      );
      await within(dialog).findByText(/소중한 의견 감사합니다/);

      await user.click(within(dialog).getByRole('button', { name: '닫기' }));
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      dialog = await openFeedbackChat(user);

      expect(within(dialog).getByText('다크모드 좋아요')).toBeInTheDocument();
      expect(within(dialog).getByText(/소중한 의견 감사합니다/)).toBeInTheDocument();
    });

    it('동아리마다 대화를 따로 보관한다', async () => {
      const user = userEvent.setup();
      interceptFeedbackRequests();
      const { unmount } = renderFab();
      const dialog = await openFeedbackChat(user);
      await user.type(
        within(dialog).getByRole('textbox', { name: '서비스 피드백 입력' }),
        'A 동아리 의견{Enter}',
      );
      await within(dialog).findByText(/소중한 의견 감사합니다/);
      unmount();

      switchClub('other-club-id');
      const otherClub = renderFab();
      const otherDialog = await openFeedbackChat(user);
      expect(within(otherDialog).queryByText('A 동아리 의견')).not.toBeInTheDocument();
      otherClub.unmount();

      switchClub(CLUB_ID);
      renderFab();
      expect(within(await openFeedbackChat(user)).getByText('A 동아리 의견')).toBeInTheDocument();
    });
  });

  it('모바일에서는 바텀시트로 연다', async () => {
    mockMatchMedia(true);
    const user = userEvent.setup();
    renderFab();

    const sheet = await openFeedbackChat(user);

    expect(within(sheet).getByRole('textbox', { name: '서비스 피드백 입력' })).toBeInTheDocument();
    expect(within(sheet).queryByRole('button', { name: '닫기' })).not.toBeInTheDocument();
  });
});
