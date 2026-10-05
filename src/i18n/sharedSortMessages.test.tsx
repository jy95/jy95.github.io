import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

import { useEntityGamesDetail } from '@/features/catalog/useEntityGamesDetail';
import { SORT_OPTIONS } from '@/features/catalog/gameSorting';
import SortSelect from '@/features/games/components/SortSelect';
import SeriesSortSelect from '@/features/series/SeriesSortSelect';
import CompanyCard from '@/features/companies/CompanyCard';
import SeriesCard from '@/features/series/SeriesCard';
import en from '../../messages/en.json';
import fr from '../../messages/fr.json';

vi.mock('@/i18n/routing', () => ({ useRouter: () => ({ back: vi.fn(), push: vi.fn() }) }));
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => true }));
vi.mock('@/features/catalog/CatalogEntityCard', () => ({
    default: ({ countLabel }: { countLabel: string }) => <div>{countLabel}</div>,
}));

function DetailLabels({ namespace }: { namespace: 'companies' | 'series' }) {
    const { labels } = useEntityGamesDetail(namespace);
    return <><div>{labels.back}</div><div>{labels.sort}</div><div>{labels.loadMore}</div>
        {SORT_OPTIONS.map(option => <div key={option}>{labels.options[option]}</div>)}</>;
}

const locales = [
    { locale: 'en' as const, messages: en, companyCounts: ['No games', '1 game', '3 games'], seriesCounts: ['0 games', '1 game', '3 games'] },
    { locale: 'fr' as const, messages: fr, companyCounts: ['Aucun jeu', '1 jeu', '3 jeux'], seriesCounts: ['0 jeu', '1 jeu', '3 jeux'] },
];

describe.each(locales)('shared sorting translations ($locale)', ({ locale, messages, companyCounts, seriesCounts }) => {
    it.each(['companies', 'series'] as const)('renders shared game labels with the %s back destination', namespace => {
        render(<NextIntlClientProvider locale={locale} messages={messages}><DetailLabels namespace={namespace} /></NextIntlClientProvider>);
        expect(screen.getByText(messages[namespace].back)).toBeInTheDocument();
        expect(screen.getByText(messages.common.gameSort.label)).toBeInTheDocument();
        expect(screen.getByText(messages.common.loadMore)).toBeInTheDocument();
        for (const option of SORT_OPTIONS) expect(screen.getByText(messages.common.gameSort[option])).toBeInTheDocument();
    });

    it.each(['games', 'series'] as const)('renders shared fields and accessible direction actions for %s', entity => {
        const onChange = vi.fn();
        const control = (descending: boolean) => entity === 'games'
            ? <SortSelect value={descending ? 'title_desc' : 'title_asc'} onChange={onChange} />
            : <SeriesSortSelect value={descending ? 'nameDesc' : 'nameAsc'} onChange={onChange} />;
        const view = render(<NextIntlClientProvider locale={locale} messages={messages}>{control(false)}</NextIntlClientProvider>);
        expect(screen.getByRole('option', { name: messages.common.sort.fields.name })).toBeInTheDocument();
        const fields = entity === 'games' ? ['default', 'releaseDate', 'duration'] as const : ['count'] as const;
        for (const field of fields) expect(screen.getByRole('option', { name: messages.common.sort.fields[field] })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: messages.common.sort.direction.desc }));
        expect(onChange).toHaveBeenLastCalledWith(entity === 'games' ? 'title_desc' : 'nameDesc');
        view.rerender(<NextIntlClientProvider locale={locale} messages={messages}>{control(true)}</NextIntlClientProvider>);
        fireEvent.click(screen.getByRole('button', { name: messages.common.sort.direction.asc }));
        expect(onChange).toHaveBeenLastCalledWith(entity === 'games' ? 'title_asc' : 'nameAsc');
    });

    it.each([0, 1, 3])('preserves entity-specific game counts at %s', gamesCount => {
        const index = gamesCount === 3 ? 2 : gamesCount;
        const item = { id: 1, title: 'Example', name: 'Example', imagePath: '', gamesCount };
        const view = render(<NextIntlClientProvider locale={locale} messages={messages}><CompanyCard company={item} /></NextIntlClientProvider>);
        expect(screen.getByText(companyCounts[index])).toBeInTheDocument();
        view.rerender(<NextIntlClientProvider locale={locale} messages={messages}><SeriesCard series={item} /></NextIntlClientProvider>);
        expect(screen.getByText(seriesCounts[index])).toBeInTheDocument();
    });
});

it('has matching shared locale structures and removes obsolete namespaces', () => {
    expect(Object.keys(en.common.gameSort)).toEqual(Object.keys(fr.common.gameSort));
    expect(Object.keys(en.common.sort)).toEqual(Object.keys(fr.common.sort));
    for (const section of ['fields', 'direction', 'options'] as const) {
        expect(Object.keys(en.common.sort[section])).toEqual(Object.keys(fr.common.sort[section]));
    }
    for (const messages of [en, fr]) {
        expect(messages.companies).not.toHaveProperty('sort');
        expect(messages.series).not.toHaveProperty('sort');
        expect(messages.series.sortSeries).toEqual({ label: messages.series.sortSeries.label });
        expect(messages.companies.sortCompanies).toEqual({ label: messages.companies.sortCompanies.label });
        expect(messages.gamesLibrary).not.toHaveProperty('sortLabels');
        expect(messages.gamesLibrary).not.toHaveProperty('sortDirection');
        expect(messages.gamesLibrary.sortForm).not.toHaveProperty('title');
    }
});
