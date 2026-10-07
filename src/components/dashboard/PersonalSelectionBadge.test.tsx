import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { emptySelection } from '@/domain/selection/operations';
import { clearSelection, SELECTION_STORAGE_KEY, toggleSelection } from '@/features/selection/storage/store';
import PersonalSelectionBadge from './PersonalSelectionBadge';

vi.mock('next-intl', () => ({
  useTranslations: () => (_key: string, values: { count: number }) => `${values.count} saved entries`,
}));

describe('PersonalSelectionBadge', () => {
  beforeEach(() => { localStorage.clear(); clearSelection(); });

  it('renders zero on the server then hydrates saved categories and updates live', () => {
    const document = { ...emptySelection(), games: ['game'], backlog: ['backlog'], dlcs: ['dlc'], planning: ['plan'] };
    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(document));
    expect(renderToString(<PersonalSelectionBadge />)).toContain('0 saved entries');
    render(<PersonalSelectionBadge />);
    expect(screen.getByLabelText('4 saved entries')).toHaveTextContent('4');
    act(() => { toggleSelection({ id: 'another', category: 'games' }); });
    expect(screen.getByLabelText('5 saved entries')).toHaveTextContent('5');
    act(() => { clearSelection(); });
    expect(screen.getByLabelText('0 saved entries')).toHaveTextContent('0');
  });

  it('handles invalid stored documents', () => {
    localStorage.setItem(SELECTION_STORAGE_KEY, 'invalid');
    render(<PersonalSelectionBadge />);
    expect(screen.getByLabelText('0 saved entries')).toBeInTheDocument();
  });

  it('handles storage read failures', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('unavailable'); });
    try {
      render(<PersonalSelectionBadge />);
      expect(screen.getByLabelText('0 saved entries')).toBeInTheDocument();
    } finally { spy.mockRestore(); }
  });
});
