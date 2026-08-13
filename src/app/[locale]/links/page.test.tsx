import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import LinksViewer from './page';

describe('LinksViewer', () => {
    it('renders the channel name', () => {
        render(<LinksViewer />);
        expect(screen.getByText('GamesPassionFR')).toBeInTheDocument();
    });

    it('renders a link for every platform with the correct href', () => {
        render(<LinksViewer />);

        expect(screen.getByRole('link', { name: /youtube/i })).toHaveAttribute(
            'href',
            'https://www.youtube.com/@GPFR1'
        );
        expect(screen.getByRole('link', { name: /discord/i })).toHaveAttribute(
            'href',
            'https://discord.gg/C2BTSAC'
        );
        expect(screen.getByRole('link', { name: /bluesky/i })).toHaveAttribute(
            'href',
            'https://bsky.app/profile/gamespassionfr.bsky.social'
        );
        expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute(
            'href',
            'https://github.com/jy95/jy95.github.io'
        );
    });

    it('opens every link in a new, safely-referrer-stripped tab', () => {
        render(<LinksViewer />);
        const links = screen.getAllByRole('link');

        expect(links.length).toBeGreaterThan(0);
        for (const link of links) {
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        }
    });

    it('renders exactly four links (Youtube, Discord, Bluesky, GitHub)', () => {
        render(<LinksViewer />);
        expect(screen.getAllByRole('link')).toHaveLength(4);
    });
});