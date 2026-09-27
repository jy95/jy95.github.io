import { createStaticSectionMetadata } from '@/i18n/staticSectionMetadata';
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    return children;
}

export const generateMetadata = createStaticSectionMetadata('video');
