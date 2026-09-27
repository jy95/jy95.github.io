import type { Metadata } from 'next';
import enMessages from '../../messages/en.json';
import frMessages from '../../messages/fr.json';

type Section = keyof typeof enMessages.pageMetadata;
type MetadataProps = { params: Promise<{ locale: string }> };

export function staticSectionMetadata(locale: string, section: Section, fields: Metadata = {}): Metadata {
    const messages = locale === 'en' ? enMessages : frMessages;
    const { title, description } = messages.pageMetadata[section];

    return {
        title,
        description,
        ...fields,
    };
}

export function createStaticSectionMetadata(section: Section, fields: Metadata = {}) {
    return async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
        return staticSectionMetadata((await params).locale, section, fields);
    };
}
