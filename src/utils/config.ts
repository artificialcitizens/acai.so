export const getToken = (name: string) => {
  console.log({ name });
  return localStorage.getItem(name);
};
