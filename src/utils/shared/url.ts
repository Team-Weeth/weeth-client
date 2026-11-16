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

type SearchParamsRecord = Record<string, string | string[] | undefined>;

/** Next.js 페이지의 `searchParams` 객체를 쿼리 문자열로 되돌린다. 배열 값은 같은 키로 반복한다. */
function toURLSearchParams(searchParams: SearchParamsRecord) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((v) => query.append(key, v));
    } else if (value !== undefined) {
      query.set(key, value);
    }
  }
  return query;
}

export {
  toURLSearchParams,
  getAppOrigin,
  getAppOriginServerFallback,
  getInviteLinkExample,
  getInviteLinkExampleServerFallback,
};
