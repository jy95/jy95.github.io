import { useEffect, useRef, useState } from 'react';
import { getPathname } from '@/i18n/routing';
import { selectionQuery } from './sharing';
import { transportError, type SelectionTransportError } from './sharingErrors';
import type { SelectionDocument } from './documentTypes';

type ShareState = { kind: 'idle' } | { kind: 'processing' } | { kind: 'ready'; url: string } | { kind: 'error'; error: SelectionTransportError };

export function useSelectionShare(isShared: boolean, locale: 'en' | 'fr') {
    const request = useRef(0);
    const [stored, setStored] = useState<{ isShared: boolean; locale: string; state: ShareState } | null>(null);

    // Invalidate pending share operations when mode changes or locale changes
    useEffect(() => () => {
        request.current++;
    }, [isShared, locale]);

    const state: ShareState = stored?.isShared === isShared && stored.locale === locale ? stored.state : { kind: 'idle' };

    async function share(document: SelectionDocument) {
        const current = ++request.current;
        const publish = (next: ShareState) => {
            if (current === request.current) setStored({ isShared, locale, state: next });
        };
        publish({ kind: 'processing' });
        try {
            const url = new URL(getPathname({ locale, href: '/selection' }), window.location.origin);
            url.search = await selectionQuery(document);
            publish({ kind: 'ready', url: url.toString() });
        } catch (error) {
            publish({ kind: 'error', error: transportError(error) });
        }
    }

    function close() {
        request.current++;
        setStored(null);
    }
    return { state, share, close };
}
