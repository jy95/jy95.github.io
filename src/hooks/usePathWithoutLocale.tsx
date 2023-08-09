"use client";

import { usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation'

export default function usePathWithoutLocale() : string {

    let cleanPath = usePathname();
    const searchParams = useSearchParams().toString();
    const supportedLocales = ["en", "fr"]; // Add more if needed

    for (const locale of supportedLocales) {
        if (cleanPath.startsWith(`/${locale}/`)) {
          cleanPath = cleanPath.substring(locale.length + 2);
          break;
        }
    }

    if (searchParams.length === 0) {
      return cleanPath;
    } else {
      return `${cleanPath}?${searchParams}`;
    }

}