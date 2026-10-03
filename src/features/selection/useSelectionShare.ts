// src/features/selection/useSelectionShare.ts
import { useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { getPathname } from '@/i18n/routing';
import { selectionQuery } from './sharing';
import { transportError, type SelectionTransportError } from './sharingErrors';
import type { SelectionDocument } from './documentTypes';

export type ShareState =
    | { kind: 'idle' }
    | { kind: 'processing' }
    | { kind: 'ready'; url: string }
    | { kind: 'error'; error: SelectionTransportError };

const IDLE_STATE: ShareState = { kind: 'idle' };

export function useSelectionShare(isShared: boolean) {
    // Automatically retrieve the active locale from next-intl's context
    const locale = useLocale();
    // Track pending share operations to avoid race conditions
    const request = useRef(0);
    const [state, setState] = useState<ShareState>(IDLE_STATE);

    async function share(document: SelectionDocument) {
        const current = ++request.current;
        setState({ kind: 'processing' });

        try {
            // Build localized pathname using current locale and target route
            const pathname = getPathname({ locale: locale, href: '/selection' });
            const url = new URL(pathname, window.location.origin);
            url.search = await selectionQuery(document);

            // Only update state if no newer request was initiated
            if (current === request.current) {
                setState({ kind: 'ready', url: url.toString() });
            }
        } catch (error) {
            // Only capture error if this request is still active
            if (current === request.current) {
                setState({ kind: 'error', error: transportError(error) });
            }
        }
    }

    function close() {
        // Invalidate any pending asynchronous operation
        request.current++;
        setState(IDLE_STATE);
    }

    return {
        // Fall back to idle state whenever share mode is inactive
        state: isShared ? state : IDLE_STATE,
        share,
        close,
    };
}