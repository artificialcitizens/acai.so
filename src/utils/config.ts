export const getToken = (name: string) => {
  console.log({ name });
  return localStorage.getItem(name) || import.meta.env.VITE_OPENAI_KEY || '';
};
