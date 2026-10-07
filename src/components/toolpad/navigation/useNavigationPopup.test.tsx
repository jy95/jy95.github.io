import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useNavigationPopup from './useNavigationPopup';

function Fixture({ enabled }: { enabled: boolean }) {
  const popup = useNavigationPopup(enabled);
  return <>
    <button ref={popup.triggerRef} {...popup.interactionProps}
      aria-expanded={popup.open} onClick={() => popup.activate(true)}>Browse</button>
    <nav ref={popup.contentRef} {...popup.interactionProps}><a href="/games">Games</a></nav>
  </>;
}

describe('useNavigationPopup lifecycle', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

  it('ignores activation and blur while disabled', () => {
    render(<Fixture enabled={false} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.blur(screen.getByRole('button'), { relatedTarget: document.body });
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['focus', 'dismissal'])('cancels pending %s work and removes listeners on disable', work => {
    const remove = vi.spyOn(document, 'removeEventListener');
    const { rerender } = render(<Fixture enabled />);
    fireEvent.click(screen.getByRole('button'));
    if (work === 'dismissal') fireEvent.blur(screen.getByRole('button'), { relatedTarget: document.body });
    expect(vi.getTimerCount()).toBe(1);
    rerender(<Fixture enabled={false} />);
    expect(vi.getTimerCount()).toBe(0);
    expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('keydown', expect.any(Function));
    act(() => { vi.runAllTimers(); });
    expect(screen.getByRole('link')).not.toHaveFocus();
    rerender(<Fixture enabled />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it.each(['focus', 'dismissal'])('cancels pending %s work and removes listeners on unmount', work => {
    const remove = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(<Fixture enabled />);
    fireEvent.click(screen.getByRole('button'));
    if (work === 'dismissal') fireEvent.blur(screen.getByRole('button'), { relatedTarget: document.body });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(remove).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    expect(remove).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
