import type { ReactNode } from 'react';

export default function PassThroughLayout({ children }: { children: ReactNode }) {
    return children;
}
