import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NavigationMenu from '@/components/dashboard/MenuEntries';
import { AppContext } from './provider/useAppContext';
import DashboardNavigation from './DashboardNavigation';
import type { NavigationItem } from './types';

vi.mock('@/i18n/routing', () => ({ usePathname: () => '/games/series/example' }));
vi.mock('./navigation/NavigationGroup', () => ({
  default: function NavigationGroup({ item, selectedPath }: { item: NavigationItem; selectedPath: string | null }) {
    const [open, setOpen] = useState(false);
    return <button onClick={() => setOpen(value => !value)} data-open={open} data-selected-path={selectedPath}>
      {item.titleKey}
    </button>;
  },
}));

describe('DashboardNavigation', () => {
  it('shares the longest matching destination across the full tree', () => {
    render(<AppContext.Provider value={{ navigation: NavigationMenu(), drawerOpen: true }}><DashboardNavigation /></AppContext.Provider>);
    for (const entry of screen.getAllByRole('button')) {
      expect(entry).toHaveAttribute('data-selected-path', '/games/series');
    }
  });

  it('preserves entry state when top-level entries reorder', () => {
    const navigation = NavigationMenu();
    const rankings = navigation.find(item => item.kind === 'group' && item.id === 'opinions');
    if (!rankings) throw new Error('Expected rankings group');
    const { rerender } = render(<AppContext.Provider value={{ navigation, drawerOpen: true }}><DashboardNavigation /></AppContext.Provider>);
    fireEvent.click(screen.getByText(rankings.titleKey));
    rerender(<AppContext.Provider value={{ navigation: [...navigation].reverse(), drawerOpen: true }}><DashboardNavigation /></AppContext.Provider>);
    expect(screen.getByText(rankings.titleKey)).toHaveAttribute('data-open', 'true');
    expect(screen.getByText('sections.browse')).toHaveAttribute('data-open', 'false');
  });
});
