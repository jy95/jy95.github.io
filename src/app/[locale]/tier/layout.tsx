import {NextIntlClientProvider} from 'next-intl';

// Types
import type { ReactNode } from "react";

type Props = {
    children: ReactNode
}

export default async function TierLayout({children} : Props) {

    return (
        <NextIntlClientProvider>
            {children}
        </NextIntlClientProvider>
    );
}