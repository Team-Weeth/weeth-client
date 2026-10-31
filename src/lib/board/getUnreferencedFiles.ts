const SRC_ATTRIBUTE_NAMES = new Set(['src', 'data-src']);

/**
 * 본문에서 src/data-src 속성값만 추출한다. HTML 엔티티(&amp;)는 디코딩한다.
 *
 * 속성 이름을 통째로 잡아 비교하므로 data-original-src처럼 이름이 src로 끝나는
 * 다른 속성은 걸리지 않는다. (부분 문자열로 찾으면 오탐이 난다)
 */
function extractSrcValues(htmlContent: string): string[] {
  const attrPattern = /([\w-]+)="([^"]*)"/g;
  const values: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = attrPattern.exec(htmlContent)) !== null) {
    const [, name, value] = match;
    if (SRC_ATTRIBUTE_NAMES.has(name)) values.push(value.replace(/&amp;/g, '&'));
  }
  return values;
}

function stripQuery(url: string): string {
  return url.includes('?') ? url.split('?')[0] : url;
}

/**
 * HTML 내에 fileUrl이 인라인 노드의 src 또는 data-src 속성으로 참조되어 있는지 확인.
 * - URL 인코딩 차이 허용 (공백 ↔ %20, 기타 퍼센트 인코딩)
 * - HTML 속성 엔티티 허용 (& ↔ &amp;)
 * - 본문 텍스트에 URL이 등장하는 경우는 참조로 판정하지 않음
 */
export function isReferencedInContent(fileUrl: string, htmlContent: string): boolean {
  const srcValues = extractSrcValues(htmlContent);
  const matchesAny = (url: string): boolean =>
    [url, url.replace(/ /g, '%20'), url.replace(/%20/gi, ' ')].some((variant) =>
      srcValues.includes(variant),
    );

  if (matchesAny(fileUrl)) return true;

  // presigned GET URL처럼 쿼리 파라미터가 포함된 경우 base URL로도 재확인
  const baseFileUrl = stripQuery(fileUrl);
  if (baseFileUrl !== fileUrl && matchesAny(baseFileUrl)) return true;

  // decodeURIComponent 정규화 후 HTML의 src/data-src 값과 비교
  // (S3 SDK마다 다를 수 있는 퍼센트 인코딩 차이, 예: %28 ↔ ( 등 허용)
  const decodedFileUrl = decodeSafely(baseFileUrl);
  return srcValues.some((value) => decodeSafely(stripQuery(value)) === decodedFileUrl);
}

/** 본문 참조 여부를 판정할 수 있는 최소 형태 */
interface ReferenceableFile {
  fileUrl: string;
  storageKey?: string;
}

function decodeSafely(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    // 잘못된 퍼센트 인코딩은 디코딩 없이 비교한다
    return value;
  }
}

/** URL에서 쿼리를 떼고 경로만 디코딩해 반환한다. 절대 URL이 아니면 입력을 그대로 쓴다. */
function toDecodedPath(url: string): string {
  const withoutQuery = stripQuery(url);
  let path = withoutQuery;
  try {
    path = new URL(withoutQuery).pathname;
  } catch {
    // 상대 경로 등 절대 URL로 파싱되지 않는 값은 그대로 둔다
  }
  return decodeSafely(path);
}

/**
 * 파일이 본문에 인라인으로 참조되어 있는지 확인한다.
 *
 * 본문에 박히는 주소는 업로드에 쓴 presigned PUT URL 기반(S3 도메인)인데,
 * 조회 응답의 fileUrl은 CDN 도메인으로 내려올 수 있어 URL 문자열 비교는 환경에 따라 실패한다.
 * 호스트와 무관한 storageKey를 우선 기준으로 삼고, 없을 때만 URL 비교로 폴백한다.
 */
export function isFileReferencedInContent(file: ReferenceableFile, htmlContent: string): boolean {
  const key = file.storageKey ? decodeSafely(file.storageKey).replace(/^\/+/, '') : '';
  const srcValues = extractSrcValues(htmlContent);

  // 1. storageKey 기반 — 호스트(CDN/S3)와 무관하게 경로로 비교
  if (key && srcValues.some((v) => toDecodedPath(v).endsWith(`/${key}`))) {
    return true;
  }

  // 2. 전체 URL 비교 — 같은 호스트, 인코딩 차이 허용
  if (isReferencedInContent(file.fileUrl, htmlContent)) return true;

  // 3. 경로 전용 폴백 — storageKey가 빈 문자열이면서 CDN↔S3 도메인이 다른 경우 방어
  const filePath = toDecodedPath(file.fileUrl);
  if (filePath !== '/' && srcValues.some((v) => toDecodedPath(v) === filePath)) {
    return true;
  }

  return false;
}
