interface PostLoginParams {
  intent?: string;
  clubId?: string;
  code?: string;
  redirectPath?: string;
}

export function getPostLoginUrl({ intent, clubId, code, redirectPath }: PostLoginParams): string {
  if (intent === 'join' && clubId && code) {
    const params = new URLSearchParams({ clubId, code });
    return `/joining?${params.toString()}`;
  }
  if (intent === 'join-no-code' && clubId) {
    return '/club/join';
  }
  if (redirectPath?.startsWith('/')) {
    return redirectPath;
  }
  if (intent) {
    const params = new URLSearchParams({ intent });
    return `/hub?${params.toString()}`;
  }

  return '/hub';
}
