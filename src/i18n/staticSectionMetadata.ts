import type { Metadata } from 'next';
import enMessages from '../../messages/en.json';
import frMessages from '../../messages/fr.json';

type Section = keyof typeof enMessages.pageMetadata;

export function staticSectionMetadata(locale: string, section: Section): Metadata {
    const messages = locale === 'en' ? enMessages : frMessages;
    const { title, description } = messages.pageMetadata[section];

    return { title, description };
}
