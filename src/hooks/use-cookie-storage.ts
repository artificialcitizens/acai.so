import { useState, useEffect, useCallback } from 'react';

type SetCookie = (value: string, expirationDays: number) => void;
type UseCookieStorageReturn = [string | null, SetCookie];

function useCookieStorage(cookieName: string): UseCookieStorageReturn {
  const [cookie, setCookieValue] = useState<string | null>(() => {
    const cookieVal = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${cookieName}=`));
    return cookieVal ? cookieVal.split('=')[1] : null;
  });

  useEffect(() => {
    document.cookie = `${cookieName}=${cookie};path=/`;
  }, [cookie, cookieName]);

  const setCookie: SetCookie = useCallback(
    (value, expirationDays) => {
      const d = new Date();
      d.setTime(d.getTime() + expirationDays * 24 * 60 * 60 * 1000);
      const expires = `expires=${d.toUTCString()}`;
      document.cookie = `${cookieName}=${value};${expires};path=/`;
      setCookieValue(value);
    },
    [cookieName],
  );

  return [cookie, setCookie];
}

export default useCookieStorage;
