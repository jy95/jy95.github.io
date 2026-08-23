import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from "react";

export default async function LocaleLayout({ children }: { children: ReactNode }) {
    return <NextIntlClientProvider>{children}</NextIntlClientProvider>;
}