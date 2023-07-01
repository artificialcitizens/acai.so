export const autoComplete = async (query: string) => {
  const response = await fetch(`http://192.168.4.74:3000/autocomplete?query=${query}`);
  return response.text();
};
