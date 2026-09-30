import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import en from '../../../../../messages/en.json';
import fr from '../../../../../messages/fr.json';
import CompaniesRow from './CompaniesRow';
import type { CardKindEntry } from '../types';
import type { CompanySummary } from '@/domain/companies/types';

const pushMock = vi.fn();
vi.mock('@/i18n/routing', () => ({
    useRouter: () => ({ push: pushMock }),
}));

const game: CardKindEntry = {
    kind: 'card',
    id: 'abc123',
    title: 'Some Game',
    imagePath: '/covers/abc123/cover.webp',
    url: 'https://example.com',
    url_type: 'VIDEO',
};

const companies: CompanySummary[] = [
    { id: 73, name: 'Ubisoft Reflections' },
    { id: 12, name: 'Another Company' },
];

const locales = [
    { locale: 'en' as const, messages: en, developers: ['Developer', 'Developers'], publishers: ['Publisher', 'Publishers'] },
    { locale: 'fr' as const, messages: fr, developers: ['Développeur', 'Développeurs'], publishers: ['Éditeur', 'Éditeurs'] },
];

describe('CompaniesRow', () => {
    beforeEach(() => pushMock.mockReset());

    describe.each(locales)('$locale translations', ({ locale, messages, ...labels }) => {
        function renderGame(entry: CardKindEntry) {
            return render(
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <CompaniesRow game={entry} />
                </NextIntlClientProvider>
            );
        }

        describe.each(['developers', 'publishers'] as const)('%s', (role) => {
            it.each([undefined, []])('renders no labels or containers for %j', (value) => {
                const { container } = renderGame({ ...game, [role]: value });
                expect(container).toBeEmptyDOMElement();
            });

            it.each([1, 2])('renders %i companies with the translated label and clickable MUI chips', (count) => {
                renderGame({ ...game, [role]: companies.slice(0, count) });
                expect(screen.getByText(labels[role][count - 1])).toBeInTheDocument();
                expect(screen.queryByText(labels[role][count === 1 ? 1 : 0])).not.toBeInTheDocument();
                expect(screen.getAllByRole('button')).toHaveLength(count);

                for (const company of companies.slice(0, count)) {
                    const chip = screen.getByRole('button', { name: company.name });
                    expect(chip).toHaveClass('MuiChip-root', 'MuiChip-clickable');
                    fireEvent.click(chip);
                    expect(pushMock).toHaveBeenLastCalledWith({
                        pathname: '/companies/[id]',
                        params: { id: String(company.id) },
                    });
                }
            });
        });

        it('counts each role independently when a company has both roles', () => {
            renderGame({ ...game, developers: companies, publishers: [companies[0]] });
            expect(screen.getByText(labels.developers[1])).toBeInTheDocument();
            expect(screen.getByText(labels.publishers[0])).toBeInTheDocument();
            expect(screen.getAllByRole('button', { name: companies[0].name })).toHaveLength(2);
        });
    });

    it('preserves the empty company display for backlog entries', () => {
        const { container } = render(
            <NextIntlClientProvider locale="en" messages={en}>
                <CompaniesRow game={{ kind: 'backlog', id: '1', title: 'Backlog', imagePath: '/cover.webp' }} />
            </NextIntlClientProvider>
        );
        expect(container).toBeEmptyDOMElement();
    });
});
