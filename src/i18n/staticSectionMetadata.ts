import type { Metadata } from 'next';
import enMessages from '../../messages/en.json';
import frMessages from '../../messages/fr.json';

type Section = keyof typeof enMessages.pageMetadata;
type MetadataProps = { params: Promise<{ locale: string }> };

export function staticSectionMetadata(locale: string, section: Section): Metadata {
    const messages = locale === 'en' ? enMessages : frMessages;
    const { title, description } = messages.pageMetadata[section];

    return { title, description };
}

export function createStaticSectionMetadata(section: Section) {
    return async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
        return staticSectionMetadata((await params).locale, section);
    };
}
