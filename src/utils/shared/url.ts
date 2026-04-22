const DEFAULT_APP_URL = 'https://weeth.kr';

function getAppOrigin() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL;
}

function getAppOriginServerFallback() {
  return process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL;
}

function getInviteLinkExample() {
  return `${getAppOrigin()}/clubId=example-club?code=abcd-abcd`;
}

function getInviteLinkExampleServerFallback() {
  return `${getAppOriginServerFallback()}/clubId=example-club?code=abcd-abcd`;
}

export {
  getAppOrigin,
  getAppOriginServerFallback,
  getInviteLinkExample,
  getInviteLinkExampleServerFallback,
};
