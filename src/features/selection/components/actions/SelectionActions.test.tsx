import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ButtonProps } from '@mui/material/Button';
import messages from '../../../../../messages/en.json';
import { SelectionActions } from './SelectionActions';
import * as sharing from '../../sharing/sharing';
import * as store from '../../storage/store';
import { emptySelection } from '@/domain/selection/operations';

// Keep the real Button rendering, but observe its handler promise for sharing tests.
const clickHandler = vi.hoisted((): { capture: boolean; result: Promise<unknown> | undefined } => ({ capture: false, result: undefined }));
vi.mock('@mui/material/Button', async importOriginal => {
  const original = await importOriginal<typeof import('@mui/material/Button')>();
  const Button = original.default;
  return {
    ...original,
    default: function ObservedButton(props: ButtonProps) {
      if (!clickHandler.capture) return <Button {...props} />;
      return <Button {...props} onClick={event => {
        const result: unknown = props.onClick?.(event);
        if (result instanceof Promise) {
          // React ignores returned promises; handle this one before it can reject.
          void result.catch(() => {});
          clickHandler.result = result;
        }
      }} />;
    },
  };
});
function clickShare(): Promise<unknown> {
  clickHandler.result = undefined;
  fireEvent.click(screen.getByRole('button', { name: messages.selection.share }));
  if (!clickHandler.result) throw new Error('Share handler did not return a promise');
  return clickHandler.result;
}
vi.mock('@/i18n/routing', () => ({ getPathname: () => '/en/selection', Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));
const document = { ...emptySelection(), games: ['visible', 'missing'], backlog: ['hidden'] };
const clipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
const nativeShare = Object.getOwnPropertyDescriptor(navigator, 'share');
const canShare = Object.getOwnPropertyDescriptor(navigator, 'canShare');
afterEach(() => {
  cleanup();
  clickHandler.capture = false;
  clickHandler.result = undefined;
  vi.restoreAllMocks();
  if (clipboard) Object.defineProperty(navigator, 'clipboard', clipboard);
  else Reflect.deleteProperty(navigator, 'clipboard');
  if (nativeShare) Object.defineProperty(navigator, 'share', nativeShare);
  else Reflect.deleteProperty(navigator, 'share');
  if (canShare) Object.defineProperty(navigator, 'canShare', canShare);
  else Reflect.deleteProperty(navigator, 'canShare');
});
function mount(captureShare = false) {
  clickHandler.capture = captureShare;
  render(<NextIntlClientProvider locale="en" messages={messages}><SelectionActions shared={false} document={document} personal={document} /></NextIntlClientProvider>);
}
function expectNoShareFeedback() {
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.queryByText(messages.selection.copied)).not.toBeInTheDocument();
  expect(screen.queryByText(messages.selection.compressionUnavailable)).not.toBeInTheDocument();
}
it.each(['unavailable', 'false', 'true'])('copies before native sharing regardless of canShare=%s', async availability => {
  const capability = vi.fn().mockReturnValue(availability === 'true');
  Object.defineProperty(navigator, 'canShare', { configurable: true, value: availability === 'unavailable' ? undefined : capability });
  const encode = vi.spyOn(sharing, 'encodeSelection').mockResolvedValue('encoded');
  let finishCopy: () => void = () => { throw new Error('Clipboard has not started'); };
  const copying = new Promise<void>(resolve => { finishCopy = resolve; });
  const share = vi.fn().mockResolvedValue(undefined);
  const writeText = vi.fn().mockReturnValue(copying);
  Object.defineProperty(navigator, 'share', { configurable: true, value: share });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  mount(true);
  const button = screen.getByRole('button', { name: messages.selection.share });
  const completion = clickShare();
  const url = new URL('/en/selection?entries=encoded', window.location.origin).toString();
  await waitFor(() => expect(writeText).toHaveBeenCalledExactlyOnceWith(url));
  expect(encode).toHaveBeenCalledWith(document);
  expect(share).not.toHaveBeenCalled();
  expect(button).toBeEnabled();
  expect(button).toHaveTextContent(messages.selection.share);
  expect(button.tagName).toBe('BUTTON');
  expect(within(button).getByTestId('ShareIcon')).toBeInTheDocument();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  await act(async () => { finishCopy(); await completion; });
  expect(share).toHaveBeenCalledExactlyOnceWith({ title: messages.selection.title, url });
  expect(capability).not.toHaveBeenCalled();
  expectNoShareFeedback();
});
it('copies before rejecting with TypeError when native sharing is unavailable', async () => {
  vi.spyOn(sharing, 'encodeSelection').mockResolvedValue('encoded');
  let finishCopy: () => void = () => { throw new Error('Clipboard has not started'); };
  const copying = new Promise<void>(resolve => { finishCopy = resolve; });
  const writeText = vi.fn().mockReturnValue(copying);
  Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  mount(true);
  const completion = clickShare();
  const settled = vi.fn();
  void completion.then(settled, settled);
  await waitFor(() => expect(writeText).toHaveBeenCalledExactlyOnceWith(new URL('/en/selection?entries=encoded', window.location.origin).toString()));
  expect(settled).not.toHaveBeenCalled();
  await act(async () => {
    finishCopy();
    await expect(completion).rejects.toBeInstanceOf(TypeError);
  });
  expectNoShareFeedback();
});
it.each([new Error('share failed'), new DOMException('cancelled', 'AbortError')])('rejects native sharing failure %s after copying', async error => {
  vi.spyOn(sharing, 'encodeSelection').mockResolvedValue('encoded');
  const share = vi.fn().mockRejectedValue(error);
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'share', { configurable: true, value: share });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  mount(true);
  await act(async () => { await expect(clickShare()).rejects.toBe(error); });
  expect(writeText).toHaveBeenCalledOnce();
  expect(share).toHaveBeenCalledExactlyOnceWith({ title: messages.selection.title, url: writeText.mock.calls[0][0] });
  expect(writeText.mock.invocationCallOrder[0]).toBeLessThan(share.mock.invocationCallOrder[0]);
  expectNoShareFeedback();
});
it('skips unavailable clipboard and invokes native sharing', async () => {
  vi.spyOn(sharing, 'encodeSelection').mockResolvedValue('encoded');
  const share = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'share', { configurable: true, value: share });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
  mount(true);
  await act(async () => { await expect(clickShare()).resolves.toBeUndefined(); });
  expect(share).toHaveBeenCalledExactlyOnceWith({
    title: messages.selection.title,
    url: new URL('/en/selection?entries=encoded', window.location.origin).toString(),
  });
  expectNoShareFeedback();
});
it.each([false, true])('rejects clipboard failure without invoking native sharing (available=%s)', async available => {
  vi.spyOn(sharing, 'encodeSelection').mockResolvedValue('encoded');
  const error = new Error('denied');
  const writeText = vi.fn().mockRejectedValue(error);
  const share = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'share', { configurable: true, value: available ? share : undefined });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  mount(true);
  await act(async () => { await expect(clickShare()).rejects.toBe(error); });
  expect(writeText).toHaveBeenCalledExactlyOnceWith(new URL('/en/selection?entries=encoded', window.location.origin).toString());
  expect(share).not.toHaveBeenCalled();
  expectNoShareFeedback();
});
it('rejects generation failure without browser API calls and recovers on retry', async () => {
  const error = new Error('failed');
  const encode = vi.spyOn(sharing, 'encodeSelection').mockRejectedValueOnce(error).mockResolvedValueOnce('new');
  const share = vi.fn().mockResolvedValue(undefined);
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'share', { configurable: true, value: share });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  mount(true);
  await act(async () => { await expect(clickShare()).rejects.toBe(error); });
  expect(encode).toHaveBeenCalledOnce();
  expect(share).not.toHaveBeenCalled();
  expect(writeText).not.toHaveBeenCalled();
  expectNoShareFeedback();
  await act(async () => { await expect(clickShare()).resolves.toBeUndefined(); });
  const url = new URL('/en/selection?entries=new', window.location.origin).toString();
  expect(writeText).toHaveBeenCalledExactlyOnceWith(url);
  expect(share).toHaveBeenCalledExactlyOnceWith({ title: messages.selection.title, url });
  expect(encode).toHaveBeenNthCalledWith(1, document);
  expect(encode).toHaveBeenNthCalledWith(2, document);
  expectNoShareFeedback();
});
it('requires clear confirmation and resets failed feedback on reopening', async () => {
  const clear = vi.spyOn(store, 'clearSelection').mockReturnValue(false);
  mount();
  fireEvent.click(screen.getByRole('button', { name: messages.selection.clear }));
  expect(clear).not.toHaveBeenCalled();
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: messages.selection.clear }));
  expect(within(screen.getByRole('dialog')).getByText(messages.selection.storageUnavailable)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: messages.selection.cancel }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: messages.selection.clear }));
  expect(screen.queryByText(messages.selection.storageUnavailable)).not.toBeInTheDocument();
  clear.mockReturnValue(true);
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: messages.selection.clear }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

it.each([false, true])('shows exactly one recovery clear action only for personal selections (shared=%s)', shared => {
  const empty = emptySelection();
  render(<NextIntlClientProvider locale="en" messages={messages}><SelectionActions shared={shared} invalid document={empty} personal={empty} /></NextIntlClientProvider>);
  expect(screen.queryAllByRole('button', { name: messages.selection.clear })).toHaveLength(shared ? 0 : 1);
});
