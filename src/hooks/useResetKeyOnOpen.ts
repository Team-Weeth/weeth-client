import { useState } from 'react';

function useResetKeyOnOpen(open: boolean) {
  const [key, setKey] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) setKey((k) => k + 1);
  }

  return key;
}

export { useResetKeyOnOpen };
