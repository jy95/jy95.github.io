import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-intl', () => ({
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import TierLayout from './layout';

describe('TierLayout', () => {
    it('renders its children', async () => {
        const jsx = await TierLayout({ children: <div>Tier Content</div> });
        render(jsx);
        expect(screen.getByText('Tier Content')).toBeInTheDocument();
    });
});
