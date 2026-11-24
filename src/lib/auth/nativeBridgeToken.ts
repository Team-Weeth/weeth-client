import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

interface NativeBridgePayload {
  accessToken: string;
  refreshToken: string;
  name?: string;
  redirectUrl: string;
}

const NATIVE_BRIDGE_AUDIENCE = 'native-bridge';
const TOKEN_TTL_MS = 60 * 1000;
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey() {
  const secret = process.env.NATIVE_BRIDGE_SECRET;
  if (!secret) throw new Error('NATIVE_BRIDGE_SECRET is not set');
  return createHash('sha256').update(secret).digest();
}

function toBase64Url(buffer: Buffer) {
  return buffer.toString('base64url');
}

export function signNativeBridgeToken(payload: NativeBridgePayload): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const body = JSON.stringify({
    ...payload,
    aud: NATIVE_BRIDGE_AUDIENCE,
    iat: Date.now(),
    exp: Date.now() + TOKEN_TTL_MS,
  });

  const ciphertext = Buffer.concat([cipher.update(body, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${toBase64Url(iv)}.${toBase64Url(Buffer.concat([ciphertext, authTag]))}`;
}

export function verifyNativeBridgeToken(token: string): NativeBridgePayload | null {
  try {
    const key = getEncryptionKey();
    const [ivPart, dataPart] = token.split('.');
    if (!ivPart || !dataPart) return null;

    const iv = Buffer.from(ivPart, 'base64url');
    const data = Buffer.from(dataPart, 'base64url');
    const authTag = data.subarray(data.length - AUTH_TAG_LENGTH);
    const ciphertext = data.subarray(0, data.length - AUTH_TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

    const parsed = JSON.parse(decrypted.toString('utf8'));

    if (parsed.aud !== NATIVE_BRIDGE_AUDIENCE) return null;
    if (typeof parsed.exp !== 'number' || parsed.exp < Date.now()) return null;
    if (typeof parsed.accessToken !== 'string' || typeof parsed.refreshToken !== 'string') {
      return null;
    }
    if (typeof parsed.redirectUrl !== 'string') return null;

    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      name: typeof parsed.name === 'string' ? parsed.name : undefined,
      redirectUrl: parsed.redirectUrl,
    };
  } catch {
    return null;
  }
}
