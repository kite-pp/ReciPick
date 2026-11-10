import { useCallback, useState } from 'react';

function readStoredValue(key, initialValue) {
  const fallbackValue = typeof initialValue === 'function' ? initialValue() : initialValue;
  if (key === null) return fallbackValue;

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue === null ? fallbackValue : JSON.parse(storedValue);
  } catch {
    return fallbackValue;
  }
}

// key가 바뀌면(예: 다른 계정으로 로그인) 그 키에 저장된 값을 다시 읽습니다.
// key가 null이면 저장소를 쓰지 않고 initialValue만 사용합니다.
export function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => ({ key, value: readStoredValue(key, initialValue) }));

  let current = state;
  if (state.key !== key) {
    current = { key, value: readStoredValue(key, initialValue) };
    setState(current);
  }

  const setStoredValue = useCallback(
    (nextValue) => {
      setState((prev) => {
        // 계정이 바뀐 뒤 늦게 도착한 업데이트는 새 계정 데이터에 쓰지 않습니다.
        if (prev.key !== key) return prev;

        const resolvedValue = typeof nextValue === 'function' ? nextValue(prev.value) : nextValue;

        if (key !== null) {
          try {
            window.localStorage.setItem(key, JSON.stringify(resolvedValue));
          } catch {
            return prev;
          }
        }

        return { key, value: resolvedValue };
      });
    },
    [key],
  );

  return [current.value, setStoredValue];
}
