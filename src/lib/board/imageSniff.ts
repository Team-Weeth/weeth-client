const SNIFF_SIZE = 12;

/**
 * ArrayBuffer의 헤더 바이트로 이미지 MIME 유형을 판정.
 * 지원 형식: PNG, JPEG, GIF, WebP, BMP
 * 이미지가 아니면 null 반환.
 */
export function sniffImageMimeType(buffer: ArrayBuffer): string | null {
  const b = new Uint8Array(buffer);
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return 'image/gif';
  if (
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  )
    return 'image/webp';
  if (b[0] === 0x42 && b[1] === 0x4d) return 'image/bmp';
  return null;
}

/**
 * 파일 바이트를 읽어 이미지 여부를 판정.
 * MIME 유형이 있으면 판정 유형과 비교해 불일치 시 올바른 유형으로 새 File 반환.
 * 이미지가 아니면 null 반환.
 */
export async function sniffAsImageFile(file: File): Promise<File | null> {
  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file.slice(0, SNIFF_SIZE));
  });
  const detectedType = sniffImageMimeType(buffer);
  if (detectedType === null) return null;
  if (file.type === detectedType) return file;
  const ext = detectedType === 'image/jpeg' ? 'jpg' : detectedType.split('/')[1];
  return new File([file], file.name || `paste.${ext}`, { type: detectedType });
}
