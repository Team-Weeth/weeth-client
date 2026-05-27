import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAP_SERVER_URL ?? 'https://weeth.kr';
const isLocalServer =
  serverUrl.startsWith('http://localhost') ||
  serverUrl.startsWith('http://127.0.0.1') ||
  serverUrl.startsWith('http://10.0.2.2');

const config: CapacitorConfig = {
  appId: 'kr.weeth.client',
  appName: 'Weeth',
  webDir: 'public',
  server: {
    url: serverUrl,
    cleartext: isLocalServer,
  },
};

export default config;
