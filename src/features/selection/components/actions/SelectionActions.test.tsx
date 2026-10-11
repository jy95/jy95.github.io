import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../../../../messages/en.json';
import { SelectionActions } from './SelectionActions';
import * as sharing from '../../sharing/sharing';
import * as store from '../../storage/store';
import { emptySelection } from '@/domain/selection/operations';

const getPathname = vi.fn<(args: unknown) => string>().mockReturnValue('/en/selection');
vi.mock('@/i18n/routing', () => ({ getPathname: (args: unknown) => getPathname(args), Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));
const document = { ...emptySelection(), games: ['visible', 'missing'], backlog: ['hidden'] };
const clipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  if (clipboard) Object.defineProperty(navigator, 'clipboard', clipboard);
  else Reflect.deleteProperty(navigator, 'clipboard');
});
function view(personal = document, shared = false, invalid = false) {
  return <NextIntlClientProvider locale="en" messages={messages}><SelectionActions shared={shared} invalid={invalid} document={document} personal={personal} /></NextIntlClientProvider>;
}
function share() { fireEvent.click(screen.getByRole('button', { name: messages.selection.share })); }
function setClipboard(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
}
it('directly copies the localized URL using the full selection document', async () => {
  const encode = vi.spyOn(sharing, 'encodeSelection').mockResolvedValue('encoded');
  const writeText = vi.fn().mockResolvedValue(undefined);
  setClipboard(writeText);
  render(view());
  share();
  expect(await screen.findByRole('status')).toHaveTextContent(messages.selection.copied);
  expect(encode).toHaveBeenCalledWith(document);
  expect(getPathname).toHaveBeenCalledWith({ locale: 'en', href: '/selection' });
  expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/en/selection?entries=encoded`);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});
it.each(['rejected', 'unavailable'])('offers a selectable non-modal fallback when clipboard is %s', async mode => {
  vi.spyOn(sharing, 'encodeSelection').mockResolvedValue('encoded');
  if (mode === 'rejected') setClipboard(vi.fn().mockRejectedValue(new Error('denied')));
  else Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
  render(view());
  share();
  expect(await screen.findByRole('alert')).toHaveTextContent(messages.selection.clipboardFailed);
  const input = screen.getByRole('textbox', { name: messages.selection.shareLink });
  expect(input).toHaveValue(`${window.location.origin}/en/selection?entries=encoded`);
  expect(input).toHaveAttribute('readonly');
  fireEvent.focus(input);
  if (!(input instanceof HTMLInputElement)) throw new Error('Expected input');
  expect(input.selectionEnd).toBe(input.value.length);
  expect(screen.getByText(messages.selection.copyFallback)).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('clears stale links and feedback on generation failure and successful retry', async () => {
  vi.spyOn(sharing, 'encodeSelection').mockResolvedValueOnce('old').mockRejectedValueOnce(new Error('failed')).mockResolvedValueOnce('new');
  const writeText = vi.fn().mockRejectedValueOnce(new Error('denied')).mockResolvedValue(undefined);
  setClipboard(writeText);
  render(view());
  share();
  await screen.findByRole('textbox');
  share();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(await screen.findByRole('alert')).toHaveTextContent(messages.selection.compressionUnavailable);
  share();
  expect(screen.queryByText(messages.selection.compressionUnavailable)).not.toBeInTheDocument();
  expect(await screen.findByRole('status')).toHaveTextContent(messages.selection.copied);
  expect(writeText).toHaveBeenLastCalledWith(`${window.location.origin}/en/selection?entries=new`);
});
it('prevents duplicate operations while generating the URL', async () => {
  let resolve: (value: string) => void = () => {};
  const encode = vi.spyOn(sharing, 'encodeSelection').mockReturnValue(new Promise<string>(done => { resolve = done; }));
  setClipboard(vi.fn().mockResolvedValue(undefined));
  render(view());
  const button = screen.getByRole('button', { name: messages.selection.share });
  fireEvent.click(button);
  expect(button).toBeDisabled();
  expect(screen.getByRole('progressbar')).toBeInTheDocument();
  fireEvent.click(button);
  expect(encode).toHaveBeenCalledTimes(1);
  resolve('encoded');
  await screen.findByRole('status');
});
it('clears immediately and keeps success feedback after the clear action unmounts', async () => {
  const clear = vi.spyOn(store, 'clearSelection').mockReturnValue(true);
  const { rerender } = render(view());
  fireEvent.click(screen.getByRole('button', { name: messages.selection.clear }));
  expect(clear).toHaveBeenCalledTimes(1);
  rerender(view(emptySelection()));
  expect(screen.queryByRole('button', { name: messages.selection.clear })).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent(messages.selection.cleared);
  fireEvent.click(screen.getByRole('button', { name: messages.selection.close }));
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
});
it('reports storage failure and allows a successful retry', () => {
  const clear = vi.spyOn(store, 'clearSelection').mockReturnValueOnce(false).mockReturnValueOnce(true);
  render(view());
  fireEvent.click(screen.getByRole('button', { name: messages.selection.clear }));
  expect(screen.getByRole('alert')).toHaveTextContent(messages.selection.storageUnavailable);
  expect(screen.queryByText(messages.selection.cleared)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: messages.selection.clear }));
  expect(clear).toHaveBeenCalledTimes(2);
  expect(screen.getByRole('status')).toHaveTextContent(messages.selection.cleared);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it.each([false, true])('shows recovery clear only for personal selections (shared=%s)', shared => {
  render(view(emptySelection(), shared, true));
  expect(screen.queryAllByRole('button', { name: messages.selection.clear })).toHaveLength(shared ? 0 : 1);
});
it('hides clear for empty valid personal selections and populated shared selections', () => {
  const { rerender } = render(view(emptySelection()));
  expect(screen.queryByRole('button', { name: messages.selection.clear })).not.toBeInTheDocument();
  rerender(view(document, true));
  expect(screen.queryByRole('button', { name: messages.selection.clear })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: messages.selection.imported })).toBeDisabled();
});
