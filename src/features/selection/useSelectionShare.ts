import { useEffect, useMemo, useRef, useState } from 'react';
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
    const scope = useMemo(() => ({ context, locale }), [context, locale]);
    const activeScope = useRef<typeof scope | null>(null);
    const request = useRef({ id: 0 });
    const [stored, setStored] = useState<{ scope: typeof scope; state: ShareState } | null>(null);
    useEffect(() => {
        activeScope.current = scope;
        const requests = request.current;
        return () => {
            activeScope.current = null;
            requests.id++;
        };
    }, [scope]);
    const state = stored?.scope === scope ? stored.state : IDLE_STATE;

    async function share(document: SelectionDocument) {
        const current = ++request.current.id;
        const publish = (next: ShareState) => {
            if (activeScope.current === scope && current === request.current.id) setStored({ scope, state: next });
        };
        publish({ kind: 'processing' });
        try {
            const url = new URL(getPathname({ locale: scope.locale, href: '/selection' }), window.location.origin);
            url.search = await selectionQuery(document);
            publish({ kind: 'ready', url: url.toString() });
        } catch (error) {
            publish({ kind: 'error', error: transportError(error) });
        }
    }

    function close() {
        request.current.id++;
        setStored(null);
    }

    return { state, share, close };
}
