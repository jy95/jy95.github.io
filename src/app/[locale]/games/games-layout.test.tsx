import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-intl', () => ({
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import GamesLayout from './layout';

describe('GamesLayout', () => {
    it('renders its children', async () => {
        const jsx = await GamesLayout({ children: <div>Games Content</div> });
        render(jsx);
        expect(screen.getByText('Games Content')).toBeInTheDocument();
    });

    it('renders multiple children passed as a fragment', async () => {
        const jsx = await GamesLayout({
            children: (
                <>
                    <span>First</span>
                    <span>Second</span>
                </>
            ),
        });
        render(jsx);
        expect(screen.getByText('First')).toBeInTheDocument();
        expect(screen.getByText('Second')).toBeInTheDocument();
    });
});
