import { useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { getPathname } from '@/i18n/routing';
import { selectionQuery } from './sharing';
import { transportError, type SelectionTransportError } from './sharingErrors';
import type { SelectionDocument } from './documentTypes';

type ShareState =
    | { kind: 'idle' }
    | { kind: 'processing' }
    | { kind: 'ready'; url: string }
    | { kind: 'error'; error: SelectionTransportError };

const IDLE_STATE: ShareState = { kind: 'idle' };

export function useSelectionShare(context: string) {
    const locale = useLocale();
    const request = useRef(0);
    const [stored, setStored] = useState<{ context: string; locale: string; state: ShareState } | null>(null);
    useEffect(() => () => { request.current++; }, [context, locale]);
    const state = stored?.context === context && stored.locale === locale ? stored.state : IDLE_STATE;

    async function share(document: SelectionDocument) {
        const current = ++request.current;
        const publish = (next: ShareState) => {
            if (current === request.current) setStored({ context, locale, state: next });
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
