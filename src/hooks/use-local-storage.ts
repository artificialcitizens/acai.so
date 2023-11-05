import { useEffect, useState } from 'react';

interface ILocalStorageObject {
  [key: string]: any;
}

export const useLocalStorage = (
  key: string,
  initialValue: ILocalStorageObject,
): [
  ILocalStorageObject,
  (value: ILocalStorageObject) => void,
  (id: string) => void,
  (id: string, newValue: any) => void,
  (id: string) => any,
] => {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    const item = window.localStorage.getItem(key);
    if (item) {
      setStoredValue(JSON.parse(item));
    }
  }, [key]);

  const setValue = (value: ILocalStorageObject) => {
    setStoredValue((prevValue) => {
      const newValue = { ...prevValue, ...value };
      if (JSON.stringify(prevValue) !== JSON.stringify(newValue)) {
        window.localStorage.setItem(key, JSON.stringify(newValue));
        return newValue;
      }
      return prevValue;
    });
  };

  const deleteValue = (id: string) => {
    setStoredValue((prevValue) => {
      const updatedValue = { ...prevValue };
      delete updatedValue[id];
      window.localStorage.setItem(key, JSON.stringify(updatedValue));
      return updatedValue;
    });
  };

  const updateValue = (
    id: string,
    newValue: { title: string; content: string },
  ) => {
    setStoredValue((prevValue) => {
      const updatedValue = { ...prevValue, [id]: newValue };
      window.localStorage.setItem(key, JSON.stringify(updatedValue));
      return updatedValue;
    });
  };
  const getValue = (id: string) => {
    if (!storedValue[id]) {
      return null;
    }
    return storedValue[id];
  };

  return [storedValue, setValue, deleteValue, updateValue, getValue];
};

export const useLocalStorageKeyValue = (
  key: string,
  initialValue: string,
): [string, (value: string) => void] => {
  const [storedValue, setStoredValue] = useState(() => {
    const item = window.localStorage.getItem(key);
    return item ? item : initialValue;
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        setStoredValue(e.newValue || '');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  const setValue = (value: string) => {
    window.localStorage.setItem(key, value);
    setStoredValue(value);
  };

  return [storedValue, setValue];
};
