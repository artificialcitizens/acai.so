export const getToken = (name: string) => {
  return window.localStorage.getItem(name);
};
