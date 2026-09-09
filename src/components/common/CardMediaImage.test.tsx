import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// next/image needs a mock in a plain jsdom test environment; forward the
// props we care about onto a plain <img> so we can assert on them directly.
vi.mock('next/image', () => ({
    default: ({ fill, priority, ...rest }: Record<string, unknown>) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img data-fill={String(!!fill)} data-priority={String(!!priority)} {...(rest as any)} />
    ),
}));

import { CardMediaImage } from './CardMediaImage';

describe('CardMediaImage', () => {
    it('renders the image with the given src and alt text', () => {
        render(<CardMediaImage src="/covers/1/cover.webp" alt="Some Game" ratio="square" />);
        const img = screen.getByAltText('Some Game');
        expect(img).toHaveAttribute('src', '/covers/1/cover.webp');
    });

    it('applies the square aspect ratio padding (100%)', () => {
        const { container } = render(<CardMediaImage src="/x.webp" alt="x" ratio="square" />);
        const ratioBox = container.querySelector('div[style*="padding-top"]') as HTMLElement;
        expect(ratioBox.style.paddingTop).toBe('100%');
    });

    it('applies the portrait aspect ratio padding (133.33%)', () => {
        const { container } = render(<CardMediaImage src="/x.webp" alt="x" ratio="portrait" />);
        const ratioBox = container.querySelector('div[style*="padding-top"]') as HTMLElement;
        expect(ratioBox.style.paddingTop).toBe('133.33%');
    });

    it('applies the video aspect ratio padding (56.25%)', () => {
        const { container } = render(<CardMediaImage src="/x.webp" alt="x" ratio="video" />);
        const ratioBox = container.querySelector('div[style*="padding-top"]') as HTMLElement;
        expect(ratioBox.style.paddingTop).toBe('56.25%');
    });

    it('defaults objectFit to "fill" when not provided', () => {
        render(<CardMediaImage src="/x.webp" alt="x" ratio="square" />);
        expect(screen.getByAltText('x').style.objectFit).toBe('fill');
    });

    it('applies a custom objectFit when provided', () => {
        render(<CardMediaImage src="/x.webp" alt="x" ratio="square" objectFit="cover" />);
        expect(screen.getByAltText('x').style.objectFit).toBe('cover');
    });

    it('uses the default responsive sizes attribute when not provided', () => {
        render(<CardMediaImage src="/x.webp" alt="x" ratio="square" />);
        expect(screen.getByAltText('x')).toHaveAttribute(
            'sizes',
            '(max-width: 600px) 45vw, (max-width: 960px) 30vw, 15vw'
        );
    });

    it('applies a custom sizes attribute when provided', () => {
        render(<CardMediaImage src="/x.webp" alt="x" ratio="square" sizes="100vw" />);
        expect(screen.getByAltText('x')).toHaveAttribute('sizes', '100vw');
    });

    it('always sets priority to false, regardless of props passed', () => {
        render(<CardMediaImage src="/x.webp" alt="x" ratio="square" />);
        expect(screen.getByAltText('x')).toHaveAttribute('data-priority', 'false');
    });

    it('always sets fill to true so the image fills its ratio box', () => {
        render(<CardMediaImage src="/x.webp" alt="x" ratio="square" />);
        expect(screen.getByAltText('x')).toHaveAttribute('data-fill', 'true');
    });
});
