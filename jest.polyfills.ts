/**
 * jest-fixed-jsdom은 fetch/Request/Response/Headers 등 Web API 글로벌을 포함한다.
 * MSW v2의 Node.js 인터셉터가 필요로 하는 추가 globals만 여기서 보완한다.
 *
 * @see https://github.com/nicolo-ribaudo/jest-fixed-jsdom
 * @see https://mswjs.io/docs/migrations/1.x-to-2.x#requestresponseheaders-are-not-defined-jest
 */

import { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from 'util';

Object.defineProperty(globalThis, 'TextDecoder', {
  value: NodeTextDecoder,
  writable: true,
});
Object.defineProperty(globalThis, 'TextEncoder', {
  value: NodeTextEncoder,
  writable: true,
});
