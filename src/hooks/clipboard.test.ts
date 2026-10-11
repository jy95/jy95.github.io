import { copyToClipboard } from './clipboard';

const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
afterEach(() => {
  if (original) Object.defineProperty(navigator, 'clipboard', original);
  else Reflect.deleteProperty(navigator, 'clipboard');
});
it('copies the exact text', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  expect(await copyToClipboard('link')).toBe(true);
  expect(writeText).toHaveBeenCalledWith('link');
});
it.each([undefined, {}, { writeText: vi.fn().mockRejectedValue(new Error('denied')) }])('returns false for unavailable or rejected clipboard access', async clipboard => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboard });
  expect(await copyToClipboard('link')).toBe(false);
});
it('handles clipboard access throwing', async () => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, get() { throw new Error('blocked'); } });
  expect(await copyToClipboard('link')).toBe(false);
});
