import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';

// Types
import type { ReactNode } from "react";

type Props = {
    children: ReactNode
}

export default async function StatsLaytou({children} : Props) {

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <NextIntlClientProvider messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}