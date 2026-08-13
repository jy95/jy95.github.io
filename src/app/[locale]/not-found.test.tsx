import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/i18n/routing', () => ({
    // Minimal stand-in that mirrors next-intl's Link: an anchor forwarding href/children.
    Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
        <a href={href}>{children}</a>
    ),
}));

import NotFoundPage from './not-found';

describe('NotFoundPage', () => {
    it('renders the not-found message', async () => {
        const jsx = await NotFoundPage();
        render(jsx);
        expect(screen.getByText("We couldn't find that page")).toBeInTheDocument();
    });

    it('renders a "Return home" link pointing at the root path', async () => {
        const jsx = await NotFoundPage();
        render(jsx);
        expect(screen.getByRole('link', { name: /return home/i })).toHaveAttribute('href', '/');
    });
});