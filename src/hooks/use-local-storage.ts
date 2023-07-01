import { useEffect, useState } from 'react';

interface ILocalStorageObject {
  [key: string]: any;
}

const useLocalStorage = (
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
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  const deleteValue = (id: string) => {
    const updatedValue = { ...storedValue };
    delete updatedValue[id];
    setStoredValue(updatedValue);
    window.localStorage.setItem(key, JSON.stringify(updatedValue));
  };

  const updateValue = (id: string, newValue: { title: string; content: string }) => {
    const updatedValue = { ...storedValue, [id]: newValue };
    setStoredValue(updatedValue);
    window.localStorage.setItem(key, JSON.stringify(updatedValue));
  };

  const getValue = (id: string) => {
    if (!storedValue[id]) {
      return null;
    }
    return storedValue[id];
  };

  return [storedValue, setValue, deleteValue, updateValue, getValue];
};

export default useLocalStorage;
