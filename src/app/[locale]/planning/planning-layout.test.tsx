import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next-intl', () => ({
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import PlanningLayout from './layout';

describe('PlanningLayout', () => {
    it('renders its children', async () => {
        const jsx = await PlanningLayout({ children: <div>Planning Content</div> });
        render(jsx);
        expect(screen.getByText('Planning Content')).toBeInTheDocument();
    });
});
