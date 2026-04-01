import { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';

export function useFormPersistence<T>(key: string, initialValue: T) {
  // Use a ref to store the current state for the debounced function
  const stateRef = useRef<T>(initialValue);

  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        stateRef.current = parsed;
        return parsed;
      }
    } catch (e) {
      console.error('Error loading form persistence:', e);
    }
    return initialValue;
  });

  // Update ref whenever state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((value: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('Error saving form persistence:', e);
      }
    }, 500),
    [key]
  );

  // Effect to trigger save on state change
  useEffect(() => {
    debouncedSave(state);
    // Cleanup to ensure final save on unmount
    return () => {
      debouncedSave.flush();
    };
  }, [state, debouncedSave]);

  const clear = () => {
    try {
      localStorage.removeItem(key);
      setState(initialValue);
    } catch (e) {
      console.error('Error clearing form persistence:', e);
    }
  };

  return [state, setState, clear] as const;
}
