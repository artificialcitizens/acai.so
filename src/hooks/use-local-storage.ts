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
      window.localStorage.setItem(key, JSON.stringify(newValue));
      return newValue;
    });
  };

  const deleteValue = (id: string) => {
    const updatedValue = { ...storedValue };
    delete updatedValue[id];
    window.localStorage.setItem(key, JSON.stringify(updatedValue));
  };

  const updateValue = (id: string, newValue: { title: string; content: string }) => {
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

export const useLocalStorageString = (key: string, initialValue: string): [string, (value: string) => void] => {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    const item = window.localStorage.getItem(key);
    if (item) {
      setStoredValue(item);
    }
  }, [key]);

  const setValue = (value: string) => {
    setStoredValue(value);
    window.localStorage.setItem(key, value);
  };

  return [storedValue, setValue];
};
