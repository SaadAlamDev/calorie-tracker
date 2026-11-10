import { useEffect, useState } from 'react';
import { readSaved } from './nutrition';

export default function useSavedState(key, initial) {
  const [value, setValue] = useState(() => readSaved(key, initial));
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { queueMicrotask(() => setStorageError(true)); }
  }, [key, value]);
  return [value, setValue, storageError];
}
