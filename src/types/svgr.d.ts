declare module '*.png' {
  import type { StaticImageData } from 'next/image';

  const src: StaticImageData;
  export default src;
}

declare module '*.svg' {
  import type { StaticImageData } from 'next/image';

  const src: StaticImageData;
  export default src;
}

declare module '*.svg?react' {
  import type * as React from 'react';

  const SVG: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default SVG;
}
