import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { echoTranslations } from '@/test/mocks/nextIntl';
import { SORT_OPTIONS } from './gameSorting';
import { useEntityGamesDetail } from './useEntityGamesDetail';

const { back } = vi.hoisted(() => ({ back: vi.fn() }));
vi.mock('next-intl', () => echoTranslations());
vi.mock('@/i18n/routing', () => ({ useRouter: () => ({ back }) }));

describe('useEntityGamesDetail', () => {
    it.each(['companies', 'series'] as const)('uses %s labels and locale-aware back navigation', namespace => {
        function Consumer() {
            const { labels, onBack } = useEntityGamesDetail(namespace);
            return <><button onClick={onBack}>{labels.back}</button><div>{labels.sort}</div>
                <div>{labels.loadMore}</div>{SORT_OPTIONS.map(option => <div key={option}>{labels.options[option]}</div>)}</>;
        }
        back.mockClear();
        render(<Consumer />);
        expect(screen.getByText('common.gameSort.label')).toBeInTheDocument();
        expect(screen.getByText('common.loadMore')).toBeInTheDocument();
        for (const option of SORT_OPTIONS) expect(screen.getByText(`common.gameSort.${option}`)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: `${namespace}.back` }));
        expect(back).toHaveBeenCalledOnce();
    });
});
