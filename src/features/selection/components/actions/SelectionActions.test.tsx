import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../../../../messages/en.json';
import { SelectionActions } from './SelectionActions';
import * as sharing from '../../sharing/sharing';
import * as store from '../../storage/store';
import { emptySelection } from '@/domain/selection/operations';

vi.mock('@/i18n/routing', () => ({ getPathname: () => '/en/selection' }));
const document = { ...emptySelection(), games: ['visible', 'missing'], backlog: ['hidden'] };
const clipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  if (clipboard) Object.defineProperty(navigator, 'clipboard', clipboard);
  else Reflect.deleteProperty(navigator, 'clipboard');
});
function mount() {
  render(<NextIntlClientProvider locale="en" messages={messages}><SelectionActions shared={false} document={document} personal={document} /></NextIntlClientProvider>);
}
it.each([true, false])('reports clipboard success=%s and resets feedback when reopened', async success => {
  vi.spyOn(sharing, 'encodeSelection').mockResolvedValue('encoded');
  const writeText = success ? vi.fn().mockResolvedValue(undefined) : vi.fn().mockRejectedValue(new Error('denied'));
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  mount();
  fireEvent.click(screen.getByRole('button', { name: messages.selection.share }));
  fireEvent.click(await screen.findByRole('button', { name: messages.selection.copy }));
  const feedback = success ? messages.selection.copied : messages.selection.copyFallback;
  expect(await screen.findByText(feedback)).toBeInTheDocument();
  expect(writeText).toHaveBeenCalledWith(expect.stringContaining('/en/selection?entries=encoded'));
  fireEvent.click(screen.getByRole('button', { name: messages.selection.close }));
  fireEvent.click(screen.getByRole('button', { name: messages.selection.share }));
  await screen.findByRole('textbox', { name: messages.selection.shareLink });
  expect(screen.queryByText(feedback)).not.toBeInTheDocument();
});
it('discards the previous link on generation failure and recovers on retry', async () => {
  const encode = vi.spyOn(sharing, 'encodeSelection').mockResolvedValueOnce('old').mockRejectedValueOnce(new Error('failed')).mockResolvedValueOnce('new');
  mount();
  fireEvent.click(screen.getByRole('button', { name: messages.selection.share }));
  await screen.findByRole('textbox', { name: messages.selection.shareLink });
  fireEvent.click(screen.getByRole('button', { name: messages.selection.close }));
  fireEvent.click(screen.getByRole('button', { name: messages.selection.share }));
  expect(await screen.findByText(messages.selection.compressionUnavailable)).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: messages.selection.share }));
  const input = await screen.findByRole('textbox', { name: messages.selection.shareLink }) as HTMLInputElement;
  expect(new URL(input.value).searchParams.get('entries')).toBe('new');
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
