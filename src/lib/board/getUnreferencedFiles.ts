/**
 * 본문에서 <img> 요소의 src 속성값만 추출한다. HTML 엔티티(&amp;)는 디코딩한다.
 *
 * img가 아닌 요소(div[data-file-attachment] 등)의 data-src는 추출하지 않는다.
 * PostCardBody가 img로 렌더하지 않는 요소는 참조로 판정하지 않기 위함이다.
 */
function extractSrcValues(htmlContent: string): string[] {
  const imgTagPattern = /<img\b[^>]*>/gi;
  const srcAttrPattern = /\ssrc="([^"]*)"/i;
  const values: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = imgTagPattern.exec(htmlContent)) !== null) {
    const srcMatch = srcAttrPattern.exec(match[0]);
    if (srcMatch) values.push(srcMatch[1].replace(/&amp;/g, '&'));
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

  // 3. 경로 전용 폴백 — storageKey가 없을 때만 실행. CDN↔S3 도메인이 달라 step 1·2를 통과하지 못한 경우를 보완한다.
  // storageKey가 있으면 step 1이 이미 정규 비교를 마쳤으므로 경로 폴백을 건너뛴다.
  // 주의: 호스트를 구분하지 않으므로, 본문에 같은 경로를 가진 외부 이미지가 있으면 오 판정이 발생할 수 있다.
  if (!key) {
    const filePath = toDecodedPath(file.fileUrl);
    if (filePath !== '/' && srcValues.some((v) => toDecodedPath(v) === filePath)) {
      return true;
    }
  }

  return false;
}
