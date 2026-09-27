import type { Metadata, ResolvingMetadata } from 'next';
import enMessages from '../../messages/en.json';
import frMessages from '../../messages/fr.json';

type Section = keyof typeof enMessages.pageMetadata;
type MetadataProps = { params: Promise<{ locale: string }> };

export function staticSectionMetadata(locale: string, section: Section, fields: Metadata = {}, parent?: Metadata | Awaited<ResolvingMetadata>): Metadata {
    const messages = locale === 'en' ? enMessages : frMessages;
    const { title, description } = messages.pageMetadata[section];

    return {
        title,
        description,
        ...fields,
        ...(fields.alternates ? {
            alternates: {
                ...parent?.alternates,
                ...fields.alternates,
                types: {
                    ...parent?.alternates?.types,
                    ...fields.alternates.types,
                },
            } as Metadata['alternates'],
        } : {}),
    };
}

export function createStaticSectionMetadata(section: Section, fields: Metadata = {}) {
    return async function generateMetadata({ params }: MetadataProps, parent?: ResolvingMetadata): Promise<Metadata> {
        return staticSectionMetadata((await params).locale, section, fields, parent ? await parent : undefined);
    };
}
