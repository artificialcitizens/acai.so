export const getCookie = (name: string) => {
  const cookieName = `${name}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookiesArray = decodedCookie.split(';');

  for (let i = 0; i < cookiesArray.length; i++) {
    const cookie = cookiesArray[i].trim();

    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }

  return '';
};
