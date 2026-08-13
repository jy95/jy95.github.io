import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-intl', () => ({
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import TestsLayout from './layout';

describe('TestsLayout', () => {
    it('renders its children', async () => {
        const jsx = await TestsLayout({ children: <div>Tests Content</div> });
        render(jsx);
        expect(screen.getByText('Tests Content')).toBeInTheDocument();
    });
});
