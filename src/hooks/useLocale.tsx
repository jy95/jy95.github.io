"use client";

import { useParams } from 'next/navigation'
import { fallbackLng, languages } from '@/i18n/settings';
import type { languagesValues } from "@/i18n/settings"

export function useLocale() : languagesValues {
    const { lng } = useParams();
    if (languages.includes(lng as any)) {
        return lng as languagesValues;
    } else {
        return fallbackLng;
    }
}