import {useLocale, NextIntlClientProvider, useMessages} from 'next-intl';

// Client component
import StatsPage from "./Stats"

export default function Stats() {

  const locale = useLocale();
  const messages = useMessages();
  if (!messages) return null;
  
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
    >
      <StatsPage />
    </NextIntlClientProvider>
  )
}
