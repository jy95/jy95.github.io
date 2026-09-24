import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const pushMock = vi.fn();
vi.mock('@/i18n/routing', () => ({
    useRouter: () => ({ push: pushMock }),
}));

vi.mock('next/image', () => ({
    default: (props: Record<string, unknown>) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={props.alt as string} src={props.src as string} />
    ),
}));

import CompanyCard from './CompanyCard';

const baseCompany = {
    id: 1,
    title: 'Capcom',
    imagePath: '/companies/1/cover.webp',
    gamesCount: 5,
};

describe('CompanyCard', () => {
    beforeEach(() => {
        pushMock.mockReset();
    });

    it('renders the company logo with the company name as alt text', () => {
        render(<CompanyCard company={baseCompany} />);
        expect(screen.getByAltText('Capcom')).toBeInTheDocument();
    });

    it('shows the games count as a badge', () => {
        render(<CompanyCard company={baseCompany} />);
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('shows 0 for a company with no games', () => {
        render(<CompanyCard company={{ ...baseCompany, gamesCount: 0 }} />);
        expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('navigates to the company detail route when clicked', () => {
        render(<CompanyCard company={baseCompany} />);
        fireEvent.click(screen.getByRole('button'));
        expect(pushMock).toHaveBeenCalledWith({
            pathname: '/games/companies/[id]',
            params: { id: '1' },
        });
    });

    it('renders a different logo and badge for a different company', () => {
        render(<CompanyCard company={{ id: 2, title: 'Insomniac Games', imagePath: '/companies/2/cover.webp', gamesCount: 12 }} />);
        expect(screen.getByAltText('Insomniac Games')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
    });
});