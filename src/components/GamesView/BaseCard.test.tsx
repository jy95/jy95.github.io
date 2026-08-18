import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('next/image', () => ({
    default: (props: Record<string, unknown>) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={props.alt as string} src={props.src as string} />
    ),
}));

import BaseCard from './BaseCard';

const item = { title: 'My Item', imagePath: '/covers/x/cover.webp' };

describe('BaseCard', () => {
    it('renders the cover image with alt text from the item title', () => {
        render(<BaseCard item={item} />);
        expect(screen.getByAltText('My Item')).toBeInTheDocument();
    });

    it('calls onClick with the item when the card is activated', () => {
        const onClick = vi.fn();
        render(<BaseCard item={item} onClick={onClick} />);
        fireEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledWith(item);
    });

    it('disables the action area when no onClick is provided', () => {
        render(<BaseCard item={item} />);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('leaves the action area enabled when onClick is provided', () => {
        render(<BaseCard item={item} onClick={vi.fn()} />);
        expect(screen.getByRole('button')).toBeEnabled();
    });

    it('renders badgesSlot content when provided', () => {
        render(<BaseCard item={item} badgesSlot={() => <span>Badge</span>} />);
        expect(screen.getByText('Badge')).toBeInTheDocument();
    });

    it('renders nothing extra when badgesSlot is omitted', () => {
        render(<BaseCard item={item} />);
        expect(screen.queryByText('Badge')).not.toBeInTheDocument();
    });

    it('renders overlaySlot content when provided', () => {
        render(<BaseCard item={item} overlaySlot={() => <span>Overlay</span>} />);
        expect(screen.getByText('Overlay')).toBeInTheDocument();
    });

    it('renders nothing extra when overlaySlot is omitted', () => {
        render(<BaseCard item={item} />);
        expect(screen.queryByText('Overlay')).not.toBeInTheDocument();
    });

    it('passes the item through to both badgesSlot and overlaySlot render props', () => {
        const badgesSlot = vi.fn(() => <span>B</span>);
        const overlaySlot = vi.fn(() => <span>O</span>);
        render(<BaseCard item={item} badgesSlot={badgesSlot} overlaySlot={overlaySlot} />);
        expect(badgesSlot).toHaveBeenCalledWith(item);
        expect(overlaySlot).toHaveBeenCalledWith(item);
    });

    it('renders both badges and overlay together without interfering with each other', () => {
        render(
            <BaseCard
                item={item}
                badgesSlot={() => <span>Badge</span>}
                overlaySlot={() => <span>Overlay</span>}
            />
        );
        expect(screen.getByText('Badge')).toBeInTheDocument();
        expect(screen.getByText('Overlay')).toBeInTheDocument();
    });
});
