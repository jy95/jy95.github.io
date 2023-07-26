"use client";

import { useParams } from 'next/navigation'
import type { languagesValues } from "@/i18n/settings"

export function useLocale() : languagesValues {
    const { lng } = useParams();
    return lng as languagesValues;
}