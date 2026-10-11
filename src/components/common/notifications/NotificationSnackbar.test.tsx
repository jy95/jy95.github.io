import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NotificationSnackbar } from './NotificationSnackbar';
import { useNotification } from './useNotification';

function Harness() {
  const { notification, success, error, dismiss } = useNotification();
  return <>
    <button onClick={() => success('Saved')}>Success</button>
    <button onClick={() => error('Failed')}>Error</button>
    <button onClick={() => success('Undo available', <button onClick={dismiss}>Undo</button>)}>Action</button>
    <NotificationSnackbar notification={notification} onDismiss={dismiss} dismissLabel="Dismiss" />
  </>;
}
afterEach(cleanup);
it('announces success and errors, supports dismissal and repeated notifications', () => {
  render(<Harness />);
  fireEvent.click(screen.getByText('Success'));
  const first = screen.getByRole('status');
  expect(first).toHaveTextContent('Saved');
  fireEvent.click(screen.getByText('Success'));
  expect(screen.getByRole('status')).not.toBe(first);
  fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Error'));
  expect(screen.getByRole('alert')).toHaveTextContent('Failed');
  fireEvent.keyDown(document.body, { key: 'Escape' });
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
it('supports optional actions alongside explicit dismissal', () => {
  render(<Harness />);
  fireEvent.click(screen.getByText('Action'));
  expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
