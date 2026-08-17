import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the external youtube-video-element/react so tests don't try to load the real player.
// The mock renders a simple div that exposes props via data attributes and inline style.
vi.mock('youtube-video-element/react', () => {
    return {
        default: (props: { controls?: boolean; src?: string; style?: Record<string, string> }) => {
            // Return a simple element that surfaces the props for assertions
            // eslint-disable-next-line react/react-in-jsx-scope
            return (
                <div
                    data-testid="yt-el"
                    data-controls={String(props.controls)}
                    data-src={props.src}
                    style={props.style as any}
                />
            );
        },
    };
});

import Player from './Player';

describe('YTPlayer Player component', () => {
    it('builds a VIDEO URL, passes controls and styles to the video element', () => {
        render(<Player type="VIDEO" identifier="abc123" />);

        const el = screen.getByTestId('yt-el');
        expect(el).toBeInTheDocument();
        expect(el).toHaveAttribute('data-src', 'https://www.youtube.com/watch?v=abc123');
        expect(el).toHaveAttribute('data-controls', 'true');

        // Check raw inline style attributes directly to avoid jsdom unit conversion
        expect(el.style.display).toBe('block');
        expect(el.style.width).toBe('100%');
        expect(el.style.height).toBe('75vh');
    });

    it('builds a PLAYLIST URL when type is PLAYLIST', () => {
        render(<Player type="PLAYLIST" identifier="PLxyz" />);

        const el = screen.getByTestId('yt-el');
        expect(el).toHaveAttribute('data-src', 'https://www.youtube.com/playlist?list=PLxyz');
        expect(el).toHaveAttribute('data-controls', 'true');
    });
});
