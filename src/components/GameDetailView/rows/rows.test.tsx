import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Echoes back a translated-looking string so we can assert both plain
// labels ("gameDetail.releaseDate") and PrettyDuration's counted strings
// ("10 hours") without a real NextIntlClientProvider.
vi.mock('next-intl', () => ({
    useTranslations: (namespace?: string) => (key: string, opts?: { count?: number }) => {
        if (opts?.count !== undefined) {
            const unit = key.split('.').pop();
            return `${opts.count} ${unit}`;
        }
        return namespace ? `${namespace}.${key}` : key;
    },
}));

import ReleaseDateRow from './ReleaseDateRow';
import DurationRow from './DurationRow';
import HltbMainRow from './HltbMainRow';
import HltbExtraRow from './HltbExtraRow';
import HltbCompletionistRow from './HltbCompletionistRow';

import type { CardKindEntry, BacklogKindEntry } from '../types';

const cardGame: CardKindEntry = {
    kind: 'card',
    id: '1',
    title: 'Some Game',
    imagePath: '/covers/1/cover.webp',
    url: 'https://example.com',
    url_type: 'VIDEO',
};

const backlogGame: BacklogKindEntry = {
    kind: 'backlog',
    id: '1',
    title: 'Some Backlog Game',
    imagePath: '/backlogcovers/1/cover.webp',
};

describe('ReleaseDateRow', () => {
    it('renders nothing when the card entry has no release date', () => {
        const { container } = render(<ReleaseDateRow game={cardGame} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the locale-formatted release date when present', () => {
        render(<ReleaseDateRow game={{ ...cardGame, releaseDate: '2020-01-01' }} />);
        expect(screen.getByText(new Date('2020-01-01').toLocaleDateString())).toBeInTheDocument();
    });

    it('renders nothing for a backlog entry, since releaseDate never applies to it', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { container } = render(<ReleaseDateRow game={backlogGame as any} />);
        expect(container).toBeEmptyDOMElement();
    });
});

describe('DurationRow (card duration)', () => {
    it('renders nothing when duration is the sentinel "00:00:00"', () => {
        const { container } = render(<DurationRow game={{ ...cardGame, duration: '00:00:00' }} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when duration is missing entirely', () => {
        const { container } = render(<DurationRow game={cardGame} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the raw duration string verbatim when meaningful', () => {
        render(<DurationRow game={{ ...cardGame, duration: '02:15:00' }} />);
        expect(screen.getByText('02:15:00')).toBeInTheDocument();
    });
});

describe('HltbMainRow', () => {
    it('renders nothing for a card entry, since hltb_main never applies to it', () => {
        const { container } = render(<HltbMainRow game={cardGame} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when hltb_main is "00:00:00"', () => {
        const { container } = render(<HltbMainRow game={{ ...backlogGame, hltb_main: '00:00:00' }} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders a pretty-printed duration when hltb_main is meaningful', () => {
        render(<HltbMainRow game={{ ...backlogGame, hltb_main: '10:38:23' }} />);
        expect(screen.getByText('10 hours 38 minutes')).toBeInTheDocument();
    });
});

describe('HltbExtraRow', () => {
    it('renders nothing when hltb_extra is missing', () => {
        const { container } = render(<HltbExtraRow game={backlogGame} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders a pretty-printed duration when hltb_extra is meaningful', () => {
        render(<HltbExtraRow game={{ ...backlogGame, hltb_extra: '01:00:00' }} />);
        expect(screen.getByText('1 hours')).toBeInTheDocument();
    });
});

describe('HltbCompletionistRow', () => {
    it('renders nothing when hltb_completionist is "00:00:00"', () => {
        const { container } = render(
            <HltbCompletionistRow game={{ ...backlogGame, hltb_completionist: '00:00:00' }} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renders a pretty-printed duration when hltb_completionist is meaningful', () => {
        render(<HltbCompletionistRow game={{ ...backlogGame, hltb_completionist: '00:45:00' }} />);
        expect(screen.getByText('45 minutes')).toBeInTheDocument();
    });

    it('renders nothing for a card entry, since hltb_completionist never applies to it', () => {
        const { container } = render(<HltbCompletionistRow game={cardGame} />);
        expect(container).toBeEmptyDOMElement();
    });
});
