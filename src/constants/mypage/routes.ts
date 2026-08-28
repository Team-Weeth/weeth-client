const MYPAGE_PROFILE_SUB_PATHS = [
  '/mypage/profiles',
  '/mypage/posts',
  '/mypage/sessions',
  '/mypage/penalties',
  '/mypage/edit',
] as const;

const MYPAGE_SETTINGS_SUB_PATHS = ['/mypage/settings'] as const;

const MOBILE_HEADER_HIDDEN_MYPAGE_PATHS = [
  '/mypage/profiles',
  '/mypage/posts',
  '/mypage/sessions',
  '/mypage/penalties',
  '/mypage/edit',
  '/mypage/settings/theme',
  '/mypage/profiles/add',
] as const;

function isMyPageProfileSubPath(pathname: string, clubId: string) {
  return MYPAGE_PROFILE_SUB_PATHS.some((path) => pathname.startsWith(`/${clubId}${path}`));
}

function isMyPageSettingsSubPath(pathname: string, clubId: string) {
  return MYPAGE_SETTINGS_SUB_PATHS.some((path) => pathname.startsWith(`/${clubId}${path}/`));
}

function shouldHideMobileHeaderOnMyPage(pathname: string, clubId: string) {
  return (
    MOBILE_HEADER_HIDDEN_MYPAGE_PATHS.some((path) => pathname.startsWith(`/${clubId}${path}`)) ||
    new RegExp(`^/${clubId}/mypage/profiles/[^/]+/edit$`).test(pathname)
  );
}

export {
  MYPAGE_PROFILE_SUB_PATHS,
  MYPAGE_SETTINGS_SUB_PATHS,
  MOBILE_HEADER_HIDDEN_MYPAGE_PATHS,
  isMyPageProfileSubPath,
  isMyPageSettingsSubPath,
  shouldHideMobileHeaderOnMyPage,
};
