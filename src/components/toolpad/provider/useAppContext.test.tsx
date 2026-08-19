// src/components/toolpad/provider/useAppContext.test.tsx
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAppContext } from './useAppContext';

describe('useAppContext', () => {
    it('returns the empty default context object when used outside a provider', () => {
        const { result } = renderHook(() => useAppContext());
        expect(result.current).toEqual({});
    });
});
