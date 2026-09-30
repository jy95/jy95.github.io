import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider, useTranslations } from 'next-intl';
import en from '../../../../messages/en.json';
import fr from '../../../../messages/fr.json';
import GamePlatform from './GamePlatform';

const { push, useGetPlatformsQuery } = vi.hoisted(() => ({
    push: vi.fn(),
    useGetPlatformsQuery: vi.fn(),
}));
vi.mock('@/i18n/routing', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/redux/services/platformsAPI', () => ({ useGetPlatformsQuery }));

const locales = [
    { locale: 'en', messages: en, labels: ['Platform', 'Platforms'] },
    { locale: 'fr', messages: fr, labels: ['Plateforme', 'Plateformes'] },
] as const;

function PlatformLabel({ count }: { count: number }) {
    const t = useTranslations('gameDetail');
    return <span>{t('platforms', { count })}</span>;
}

function renderPlatform(platformId = 1) {
    return render(
        <NextIntlClientProvider locale="en" messages={en}>
            <GamePlatform platformId={platformId} />
        </NextIntlClientProvider>
    );
}

describe('GamePlatform', () => {
    beforeEach(() => {
        push.mockReset();
        useGetPlatformsQuery.mockReset();
        useGetPlatformsQuery.mockReturnValue({ data: [{ id: 1, name: 'PC' }] });
    });

    describe.each(locales)('$locale translations', ({ locale, messages, labels }) => {
        it.each([
            { id: 1, name: 'PC' },
            { id: 2, name: 'GBA' },
        ])('renders the singular field label with a GamepadIcon and an icon-only $name chip', (platform) => {
            useGetPlatformsQuery.mockReturnValue({ data: [platform] });
            render(
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <GamePlatform platformId={platform.id} />
                </NextIntlClientProvider>
            );
            const label = screen.getByText(labels[0]);
            expect(screen.queryByText(labels[1])).not.toBeInTheDocument();
            const chip = screen.getByRole('button', { name: platform.name });
            const fieldIcon = label.parentElement?.querySelector('svg');
            const chipIcon = chip.querySelector('svg');
            expect(fieldIcon).toBe(screen.getByTestId('GamepadIcon'));
            expect(fieldIcon).toHaveClass('MuiSvgIcon-fontSizeSmall');
            expect(chipIcon).toHaveClass('MuiSvgIcon-root');
            expect(chip.querySelectorAll('svg')).toHaveLength(1);
            expect(chip).toHaveAttribute('aria-label', platform.name);
            expect(chip).toHaveTextContent(/^$/);
            expect(screen.queryByText(platform.name)).not.toBeInTheDocument();
            expect(fieldIcon).not.toBe(chipIcon);
            expect(chip).not.toContainElement(fieldIcon ?? null);
            expect(fieldIcon?.querySelector('path')?.getAttribute('d')).toBeTruthy();
            expect(fieldIcon?.querySelector('path')?.getAttribute('d')).not.toBe(chipIcon?.querySelector('path')?.getAttribute('d'));
            expect(chip.tagName).toBe('SPAN');
        });

        it.each([1, 2])('supports the platform translation for count %i', (count) => {
            render(
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <PlatformLabel count={count} />
                </NextIntlClientProvider>
            );
            expect(screen.getByText(labels[count - 1])).toBeInTheDocument();
        });
    });

    it('keeps the GamepadIcon field icon when the platform chip icon changes', () => {
        useGetPlatformsQuery.mockReturnValue({ data: [{ id: 1, name: 'PC' }, { id: 2, name: 'GBA' }] });
        const { rerender } = renderPlatform(1);
        const fieldIcon = screen.getByTestId('GamepadIcon');
        const pcIconPaths = Array.from(screen.getByRole('button', { name: 'PC' }).querySelectorAll('path'))
            .map(path => path.getAttribute('d'));
        expect(pcIconPaths.length).toBeGreaterThan(0);
        rerender(
            <NextIntlClientProvider locale="en" messages={en}>
                <GamePlatform platformId={2} />
            </NextIntlClientProvider>
        );
        const chip = screen.getByRole('button', { name: 'GBA' });
        const gbaIconPaths = Array.from(chip.querySelectorAll('path')).map(path => path.getAttribute('d'));
        expect(gbaIconPaths.length).toBeGreaterThan(0);
        expect(gbaIconPaths).not.toEqual(pcIconPaths);
        expect(screen.getByTestId('GamepadIcon')).toBe(fieldIcon);
        expect(chip).not.toContainElement(fieldIcon);
        expect(chip.querySelectorAll('svg')).toHaveLength(1);
        expect(chip).toHaveAttribute('aria-label', 'GBA');
        expect(chip).toHaveTextContent(/^$/);
    });

    it('renders no field while platforms are loading, then shows the matching platform', () => {
        useGetPlatformsQuery.mockReturnValue({ data: undefined, isLoading: true });
        const { container, rerender } = renderPlatform();
        expect(container).toBeEmptyDOMElement();
        useGetPlatformsQuery.mockReturnValue({ data: [{ id: 1, name: 'PC' }], isLoading: false });
        rerender(
            <NextIntlClientProvider locale="en" messages={en}>
                <GamePlatform platformId={1} />
            </NextIntlClientProvider>
        );
        expect(screen.getByText('Platform')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'PC' })).toBeInTheDocument();
    });

    it('renders no field when the platform ID has no match', () => {
        const { container } = renderPlatform(2);
        expect(container).toBeEmptyDOMElement();
    });

    it.each(['click', 'Enter', ' '])('opens the matching platform filter with %s', (activation) => {
        useGetPlatformsQuery.mockReturnValue({ data: [{ id: 1, name: 'PC' }, { id: 2, name: 'GBA' }] });
        renderPlatform(2);
        const chip = screen.getByRole('button', { name: 'GBA' });
        expect(chip).toHaveAttribute('tabindex', '0');
        expect(chip).toHaveClass('MuiChip-clickable', 'MuiChip-outlined', 'MuiChip-sizeSmall');
        if (activation === 'click') fireEvent.click(chip);
        else {
            fireEvent.keyDown(chip, { key: activation });
            fireEvent.keyUp(chip, { key: activation });
        }
        expect(push).toHaveBeenCalledExactlyOnceWith({ pathname: '/games', query: { platform: '2' } });
    });
});
