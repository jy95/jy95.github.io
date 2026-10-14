import { render } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

const navigateToRandomGame = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useNavigateToRandomGame', () => ({ useNavigateToRandomGame: () => ({ navigateToRandomGame }) }));

import Random from './PageClient';

it('navigates to a random game once when mounted', () => {
    const { rerender } = render(<Random />);
    expect(navigateToRandomGame).toHaveBeenCalledOnce();
    rerender(<Random />);
    expect(navigateToRandomGame).toHaveBeenCalledOnce();
});
