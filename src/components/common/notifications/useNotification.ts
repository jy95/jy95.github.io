'use client';

import { useCallback, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export type Notification = {
  id: number;
  message: string;
  severity: 'success' | 'error';
  action?: ReactNode;
};

export function useNotification() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const sequence = useRef(0);
  const dismiss = useCallback(() => setNotification(null), []);
  const success = useCallback((message: string, action?: ReactNode) => {
    setNotification({ id: ++sequence.current, severity: 'success', message, action });
  }, []);
  const error = useCallback((message: string, action?: ReactNode) => {
    setNotification({ id: ++sequence.current, severity: 'error', message, action });
  }, []);
  return { notification, success, error, dismiss };
}

export type NotificationApi = Pick<ReturnType<typeof useNotification>, 'success' | 'error' | 'dismiss'>;
