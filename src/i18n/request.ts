import * as rootParams from 'next/root-params';
import {getRequestConfig} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {hasLocale} from 'next-intl';

export default getRequestConfig(async () => {
  
  // Typically corresponds to the `[locale]` segment
  const requested = await rootParams.locale();;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
 
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
