import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-intl', () => ({
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import StatsLayout from './layout';

describe('StatsLayout', () => {
    it('renders its children', async () => {
        const jsx = await StatsLayout({ children: <div>Stats Content</div> });
        render(jsx);
        expect(screen.getByText('Stats Content')).toBeInTheDocument();
    });
});
