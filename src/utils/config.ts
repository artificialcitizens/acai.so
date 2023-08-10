export const getToken = (name: string) => {
  return localStorage.getItem(name);
};
