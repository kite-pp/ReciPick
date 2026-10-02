import { useState } from 'react';

function readStoredValue(key, initialValue) {
  const fallbackValue = typeof initialValue === 'function' ? initialValue() : initialValue;

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue === null ? fallbackValue : JSON.parse(storedValue);
  } catch {
    return fallbackValue;
  }
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStoredValue(key, initialValue));

  const setStoredValue = (nextValue) => {
    setValue((currentValue) => {
      const resolvedValue = typeof nextValue === 'function' ? nextValue(currentValue) : nextValue;

      try {
        window.localStorage.setItem(key, JSON.stringify(resolvedValue));
      } catch {
        return currentValue;
      }

      return resolvedValue;
    });
  };

  return [value, setStoredValue];
}
