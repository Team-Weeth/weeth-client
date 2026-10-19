/**
 * HTML 내에 fileUrl이 인라인 노드의 src 또는 data-src 속성으로 참조되어 있는지 확인.
 * - URL 인코딩 차이 허용 (공백 ↔ %20, 기타 퍼센트 인코딩)
 * - HTML 속성 엔티티 허용 (& ↔ &amp;)
 * - 본문 텍스트에 URL이 등장하는 경우는 참조로 판정하지 않음
 */
export function isReferencedInContent(fileUrl: string, htmlContent: string): boolean {
  const checkUrl = (url: string): boolean => {
    const variants = [url, url.replace(/ /g, '%20'), url.replace(/%20/gi, ' ')];
    return variants.some((v) => {
      const encoded = v.replace(/&/g, '&amp;');
      return (
        htmlContent.includes(`src="${v}"`) ||
        htmlContent.includes(`src="${encoded}"`) ||
        htmlContent.includes(`data-src="${v}"`) ||
        htmlContent.includes(`data-src="${encoded}"`)
      );
    });
  };

  if (checkUrl(fileUrl)) return true;

  // presigned GET URL처럼 쿼리 파라미터가 포함된 경우 base URL로도 재확인
  const baseFileUrl = fileUrl.includes('?') ? fileUrl.split('?')[0] : fileUrl;
  if (baseFileUrl !== fileUrl && checkUrl(baseFileUrl)) return true;

  // decodeURIComponent 정규화 후 HTML의 src/data-src 값과 비교
  // (S3 SDK마다 다를 수 있는 퍼센트 인코딩 차이, 예: %28 ↔ ( 등 허용)
  let decodedFileUrl: string;
  try {
    decodedFileUrl = decodeURIComponent(baseFileUrl);
  } catch {
    decodedFileUrl = baseFileUrl;
  }

  const attrPattern = /(?:src|data-src)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = attrPattern.exec(htmlContent)) !== null) {
    const rawAttr = m[1].replace(/&amp;/g, '&');
    const baseRawAttr = rawAttr.includes('?') ? rawAttr.split('?')[0] : rawAttr;
    let decodedAttr: string;
    try {
      decodedAttr = decodeURIComponent(baseRawAttr);
    } catch {
      decodedAttr = baseRawAttr;
    }
    if (decodedAttr === decodedFileUrl) return true;
  }

  return false;
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
  const withoutQuery = url.split('?')[0];
  let path = withoutQuery;
  try {
    path = new URL(withoutQuery).pathname;
  } catch {
    // 상대 경로 등 절대 URL로 파싱되지 않는 값은 그대로 둔다
  }
  return decodeSafely(path);
}

/** 본문의 src/data-src 속성값을 모두 경로로 정규화해 반환한다. */
function extractReferencedPaths(htmlContent: string): string[] {
  const attrPattern = /(?:src|data-src)="([^"]*)"/g;
  const paths: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = attrPattern.exec(htmlContent)) !== null) {
    paths.push(toDecodedPath(match[1].replace(/&amp;/g, '&')));
  }
  return paths;
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

  if (key && extractReferencedPaths(htmlContent).some((path) => path.endsWith(`/${key}`))) {
    return true;
  }

  return isReferencedInContent(file.fileUrl, htmlContent);
}
