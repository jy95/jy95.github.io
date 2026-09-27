import { staticSectionMetadata } from '@/i18n/staticSectionMetadata';
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    return children;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    return staticSectionMetadata((await params).locale, 'companies');
}
