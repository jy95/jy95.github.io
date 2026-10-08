import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useNavigationPopup from './useNavigationPopup';

function Fixture({ enabled, preventEscape = false }: { enabled: boolean; preventEscape?: boolean }) {
  const popup = useNavigationPopup(enabled);
  return <>
    <button ref={popup.triggerRef} {...popup.interactionProps}
      aria-expanded={popup.open} onClick={() => popup.activate(true)}>Browse</button>
    <nav ref={popup.contentRef} {...popup.interactionProps}>
      <a href="/games" onKeyDown={event => {
        if (preventEscape && event.key === 'Escape') event.preventDefault();
      }}>Games</a>
    </nav>
  </>;
}

describe('useNavigationPopup lifecycle', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

  it('honors prevented Escape from content and stops handled Escape propagation', () => {
    const onDocumentKeyDown = vi.fn();
    document.addEventListener('keydown', onDocumentKeyDown);
    const { rerender } = render(<Fixture enabled preventEscape />);
    const button = screen.getByRole('button');
    const link = screen.getByRole('link');
    fireEvent.click(button);
    act(() => { vi.advanceTimersByTime(0); });
    expect(link).toHaveFocus();
    fireEvent.keyDown(link, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(link).toHaveFocus();
    expect(onDocumentKeyDown).toHaveBeenCalledTimes(1);
    onDocumentKeyDown.mockClear();
    rerender(<Fixture enabled />);
    fireEvent.keyDown(link, { key: 'Enter' });
    expect(button).toHaveAttribute('aria-expanded', 'true');
    onDocumentKeyDown.mockClear();
    fireEvent.keyDown(link, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
    expect(onDocumentKeyDown).not.toHaveBeenCalled();
    document.removeEventListener('keydown', onDocumentKeyDown);
  });

  it('keeps internal focus and pointer activation inside the disclosure', () => {
    render(<Fixture enabled />);
    const button = screen.getByRole('button');
    const link = screen.getByRole('link');
    fireEvent.click(button);
    act(() => { vi.advanceTimersByTime(0); });
    const schedule = vi.spyOn(globalThis, 'setTimeout');
    fireEvent.blur(link, { relatedTarget: button });
    expect(schedule).not.toHaveBeenCalled();
    fireEvent.pointerDown(link);
    fireEvent.pointerDown(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    fireEvent.blur(link, { relatedTarget: document.body });
    act(() => { vi.advanceTimersByTime(150); });
    expect(button).toHaveAttribute('aria-expanded', 'true');
    act(() => { button.focus(); });
    fireEvent.blur(button, { relatedTarget: document.body });
    act(() => { button.blur(); vi.advanceTimersByTime(150); });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

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
