import { useState, useEffect } from 'react';

export function useFormPersist<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setState(JSON.parse(item));
      }
    } catch (error) {
      console.warn('Error reading localStorage', error);
    }
    setIsLoaded(true);
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(state) : value;
      setState(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn('Error setting localStorage', error);
    }
  };

  const clearValue = () => {
    setState(initialValue);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  };

  return [state, setValue, isLoaded, clearValue] as const;
}
