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
it.each([false, true])('shares the localized encoded URL natively without copying or opening a modal (canShare available=%s)', async canShareAvailable => {
  Object.defineProperty(navigator, 'canShare', { configurable: true, value: canShareAvailable ? vi.fn().mockReturnValue(true) : undefined });
  const encode = vi.spyOn(sharing, 'encodeSelection').mockResolvedValue('encoded');
  const share = vi.fn().mockResolvedValue(undefined);
  const writeText = vi.fn();
  Object.defineProperty(navigator, 'share', { configurable: true, value: share });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  mount();
  fireEvent.click(screen.getByRole('button', { name: messages.selection.share }));
  await waitFor(() => expect(share).toHaveBeenCalledWith({
    title: messages.selection.title,
    url: new URL('/en/selection?entries=encoded', window.location.origin).toString(),
  }));
  expect(encode).toHaveBeenCalledWith(document);
  expect(writeText).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.queryByText(messages.selection.copied)).not.toBeInTheDocument();
});
it('copies the localized encoded URL and confirms success when native sharing is unavailable', async () => {
  vi.spyOn(sharing, 'encodeSelection').mockResolvedValue('encoded');
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  mount();
  fireEvent.click(screen.getByRole('button', { name: messages.selection.share }));
  expect(await screen.findByText(messages.selection.copied)).toBeInTheDocument();
  expect(writeText).toHaveBeenCalledWith(new URL('/en/selection?entries=encoded', window.location.origin).toString());
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('ignores native share cancellation without copying', async () => {
  vi.spyOn(sharing, 'encodeSelection').mockResolvedValue('encoded');
  const share = vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError'));
  const writeText = vi.fn();
  Object.defineProperty(navigator, 'share', { configurable: true, value: share });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  mount();
  fireEvent.click(screen.getByRole('button', { name: messages.selection.share }));
  await waitFor(() => expect(share).toHaveBeenCalledOnce());
  await act(async () => { await share.mock.results[0].value.catch(() => undefined); });
  expect(writeText).not.toHaveBeenCalled();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.queryByText(messages.selection.copied)).not.toBeInTheDocument();
});
it('ignores clipboard rejection', async () => {
  vi.spyOn(sharing, 'encodeSelection').mockResolvedValue('encoded');
  const writeText = vi.fn().mockRejectedValue(new Error('denied'));
  Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  mount();
  fireEvent.click(screen.getByRole('button', { name: messages.selection.share }));
  await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
  await act(async () => { await writeText.mock.results[0].value.catch(() => undefined); });
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.queryByText(messages.selection.copied)).not.toBeInTheDocument();
});
it('reports generation failure without sharing and recovers on retry', async () => {
  const encode = vi.spyOn(sharing, 'encodeSelection').mockRejectedValueOnce(new Error('failed')).mockResolvedValueOnce('new');
  const share = vi.fn().mockResolvedValue(undefined);
  const writeText = vi.fn();
  Object.defineProperty(navigator, 'share', { configurable: true, value: share });
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  mount();
  fireEvent.click(screen.getByRole('button', { name: messages.selection.share }));
  expect(await screen.findByText(messages.selection.compressionUnavailable)).toBeInTheDocument();
  expect(share).not.toHaveBeenCalled();
  expect(writeText).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: messages.selection.share }));
  await waitFor(() => expect(share).toHaveBeenCalledWith({
    title: messages.selection.title,
    url: new URL('/en/selection?entries=new', window.location.origin).toString(),
  }));
  expect(screen.queryByText(messages.selection.compressionUnavailable)).not.toBeInTheDocument();
  expect(encode).toHaveBeenCalledWith(document);
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
