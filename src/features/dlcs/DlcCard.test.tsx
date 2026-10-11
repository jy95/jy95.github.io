import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CSSProperties } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { echoTranslations } from '@/test/mocks/nextIntl';

vi.mock('next-intl', () => echoTranslations());

const pushMock = vi.fn();
vi.mock('@/i18n/routing', () => ({
    useRouter: () => ({ push: pushMock }),
}));

vi.mock('next/image', () => ({
    default: (props: { alt: string; src: string; style: CSSProperties }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={props.alt} src={props.src} style={props.style} />
    ),
}));

import DlcCard from './DlcCard';

const parentGame = {
    id: "parent-id",
    name: 'Batman',
    imagePath: '/covers/parent-id/cover.webp',
    dlcsCount: 5,
};

describe('DlcCard', () => {
    beforeEach(() => {
        pushMock.mockReset();
    });

    it('renders the parent cover with the parent title as alt text', () => {
        render(<DlcCard group={parentGame} />);
        expect(screen.getByAltText('Batman')).toHaveAttribute('src', parentGame.imagePath);
        expect(screen.getByAltText('Batman')).toHaveStyle({ objectFit: 'cover' });
        expect(screen.getByRole('button', { name: /Batman/ })).toBeInTheDocument();
    });

    it('shows the name and translated count in a persistent bottom overlay', () => {
        render(<DlcCard group={parentGame} />);
        expect(screen.getByText('Batman')).toBeInTheDocument();
        expect(screen.getByText('dlcs.dlcsCount:{"count":5}')).toBeInTheDocument();
        expect(screen.getByText('Batman').parentElement).toHaveStyle({ top: 'auto', opacity: '1' });
    });

    it('shows 0 for a parent game with no DLCs', () => {
        render(<DlcCard group={{ ...parentGame, dlcsCount: 0 }} />);
        expect(screen.getByText('dlcs.dlcsCount:{"count":0}')).toBeInTheDocument();
    });

    it('navigates to the DLC detail route when clicked', () => {
        render(<DlcCard group={parentGame} />);
        fireEvent.click(screen.getByRole('button'));
        expect(pushMock).toHaveBeenCalledWith({
            pathname: '/games/dlcs/[id]',
            params: { id: 'parent-id' },
        });
    });

    it('renders a different cover and badge for a different parent game', () => {
        render(<DlcCard group={{ id: "other-parent", name: 'Zelda', imagePath: '/covers/other-parent/cover.webp', dlcsCount: 12 }} />);
        expect(screen.getByAltText('Zelda')).toBeInTheDocument();
        expect(screen.getByText('dlcs.dlcsCount:{"count":12}')).toBeInTheDocument();
    });
});
