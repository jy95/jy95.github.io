import { Suspense } from 'react';
import { act, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import StoreProvider from './StoreProvider';
import { useAppSelector } from '@/redux/hooks';
import { SELECTION_STORAGE_KEY } from '@/features/selection/selectionSlice';

it('preserves server HTML while storage loads before a suspended child hydrates', async () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, '["saved-game"]');
    let suspended = false;
    let resume!: () => void;
    const pending = new Promise<void>(resolve => { resume = resolve; });
    function Child() {
        const { hydrated, ids } = useAppSelector(state => state.selection);
        if (suspended) throw pending;
        return <p>{hydrated ? ids.join(',') : 'Loading'}</p>;
    }
    const tree = <StoreProvider><Suspense fallback={<p>Waiting</p>}><Child /></Suspense></StoreProvider>;
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree);
    document.body.append(container);
    const onRecoverableError = vi.fn();
    let root: Root;
    suspended = true;
    await act(async () => { root = hydrateRoot(container, tree, { onRecoverableError }); });
    expect(container.textContent).toBe('Loading');
    suspended = false;
    await act(async () => { resume(); });
    await waitFor(() => expect(container.textContent).toBe('saved-game'));
    expect(onRecoverableError).not.toHaveBeenCalled();
    await act(async () => { root.unmount(); });
    container.remove();
    localStorage.clear();
});
