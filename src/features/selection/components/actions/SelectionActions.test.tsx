import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../../../../messages/en.json';
import { SelectionActions } from './SelectionActions';
import * as sharing from '../../sharing/sharing';
import * as store from '../../storage/store';
import { emptySelection } from '@/domain/selection/operations';

vi.mock('@/i18n/routing', () => ({ getPathname: () => '/en/selection', Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));
const document = { ...emptySelection(), games: ['visible', 'missing'], backlog: ['hidden'] };
const clipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
const nativeShare = Object.getOwnPropertyDescriptor(navigator, 'share');
const canShare = Object.getOwnPropertyDescriptor(navigator, 'canShare');
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  if (clipboard) Object.defineProperty(navigator, 'clipboard', clipboard);
  else Reflect.deleteProperty(navigator, 'clipboard');
  if (nativeShare) Object.defineProperty(navigator, 'share', nativeShare);
  else Reflect.deleteProperty(navigator, 'share');
  if (canShare) Object.defineProperty(navigator, 'canShare', canShare);
  else Reflect.deleteProperty(navigator, 'canShare');
});
function mount() {
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
  mount();
  const button = screen.getByRole('button', { name: messages.selection.share });
  fireEvent.click(button);
  const url = new URL('/en/selection?entries=encoded', window.location.origin).toString();
  await waitFor(() => expect(writeText).toHaveBeenCalledExactlyOnceWith(url));
  expect(encode).toHaveBeenCalledWith(document);
  expect(share).not.toHaveBeenCalled();
  expect(button).toBeEnabled();
  expect(button).toHaveTextContent(messages.selection.share);
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  await act(async () => { finishCopy(); await copying; });
  expect(share).toHaveBeenCalledExactlyOnceWith({ title: messages.selection.title, url });
  expect(capability).not.toHaveBeenCalled();
  expectNoShareFeedback();
});
it('copies without feedback when native sharing is unavailable', async () => {
  vi.spyOn(sharing, 'encodeSelection').mockResolvedValue('encoded');
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  mount();
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: messages.selection.share })); });
  expect(writeText).toHaveBeenCalledExactlyOnceWith(new URL('/en/selection?entries=encoded', window.location.origin).toString());
  expectNoShareFeedback();
});
it('silently ignores native share cancellation after copying', async () => {
  vi.spyOn(sharing, 'encodeSelection').mockResolvedValue('encoded');
  const share = vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError'));
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'share', { configurable: true, value: share });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  mount();
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: messages.selection.share })); });
  expect(writeText).toHaveBeenCalledOnce();
  expect(share).toHaveBeenCalledExactlyOnceWith({ title: messages.selection.title, url: writeText.mock.calls[0][0] });
  expectNoShareFeedback();
});
it.each(['rejected', 'unavailable'])('attempts native sharing after clipboard is %s', async availability => {
  vi.spyOn(sharing, 'encodeSelection').mockResolvedValue('encoded');
  const writeText = vi.fn().mockRejectedValue(new Error('denied'));
  const share = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'share', { configurable: true, value: share });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: availability === 'unavailable' ? undefined : { writeText } });
  mount();
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: messages.selection.share })); });
  expect(writeText).toHaveBeenCalledTimes(availability === 'unavailable' ? 0 : 1);
  expect(share).toHaveBeenCalledExactlyOnceWith({
    title: messages.selection.title,
    url: new URL('/en/selection?entries=encoded', window.location.origin).toString(),
  });
  expectNoShareFeedback();
});
it('silently ignores clipboard rejection when native sharing is unavailable', async () => {
  vi.spyOn(sharing, 'encodeSelection').mockResolvedValue('encoded');
  const writeText = vi.fn().mockRejectedValue(new Error('denied'));
  Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  mount();
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: messages.selection.share })); });
  expect(writeText).toHaveBeenCalledOnce();
  expectNoShareFeedback();
});
it('silently ignores generation failure without browser API calls and recovers on retry', async () => {
  const encode = vi.spyOn(sharing, 'encodeSelection').mockRejectedValueOnce(new Error('failed')).mockResolvedValueOnce('new');
  const share = vi.fn().mockResolvedValue(undefined);
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'share', { configurable: true, value: share });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  mount();
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: messages.selection.share })); });
  expect(encode).toHaveBeenCalledOnce();
  expect(share).not.toHaveBeenCalled();
  expect(writeText).not.toHaveBeenCalled();
  expectNoShareFeedback();
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: messages.selection.share })); });
  const url = new URL('/en/selection?entries=new', window.location.origin).toString();
  expect(writeText).toHaveBeenCalledExactlyOnceWith(url);
  expect(share).toHaveBeenCalledExactlyOnceWith({ title: messages.selection.title, url });
  expect(encode).toHaveBeenCalledWith(document);
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
