import type { ReactNode } from 'react';

export const RenderIf = ({ children, condition }: { children: ReactNode; condition: boolean }) => {
  return condition ? children : null;
};
