interface OAuthStateParams {
  intent?: string;
  clubId?: string;
  code?: string;
  redirectPath?: string;
}

export function encodeOAuthState({ intent, clubId, code, redirectPath }: OAuthStateParams): string | undefined {
  if (intent === 'join' && clubId && code) return `join:${clubId}:${code}`;
  if (intent === 'join-no-code' && clubId) return `join-no-code:${clubId}`;
  if (intent) return intent;
  if (redirectPath) return redirectPath;
  return undefined;
}

export type OAuthState =
  | { type: 'join'; clubId: string; code: string }
  | { type: 'join-no-code'; clubId: string }
  | { type: 'redirect'; path: string }
  | { type: 'intent'; intent: string }
  | { type: 'none' }
  | { type: 'invalid' };

export function decodeOAuthState(state: string | null): OAuthState {
  if (!state) return { type: 'none' };

  if (state.startsWith('join-no-code:')) {
    const clubId = state.slice('join-no-code:'.length);
    if (!clubId) return { type: 'invalid' };
    return { type: 'join-no-code', clubId };
  }

  if (state.startsWith('join:')) {
    const [, clubId, code] = state.split(':');
    if (!clubId || !code) return { type: 'invalid' };
    return { type: 'join', clubId, code };
  }

  if (state.startsWith('/')) {
    return { type: 'redirect', path: state };
  }

  return { type: 'intent', intent: state };
}
