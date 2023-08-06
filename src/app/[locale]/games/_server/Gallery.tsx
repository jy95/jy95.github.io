import {useLocale, NextIntlClientProvider, useMessages} from 'next-intl';

// Client components

export default function Gallery() {

    const locale = useLocale();
    const messages = useMessages();
    if (!messages) return null;

    return (
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
        >
          
        </NextIntlClientProvider>
    )

}