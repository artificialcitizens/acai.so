export const queryPinecone = async (query: string) => {
  const response = await fetch(`http://192.168.4.74:3000/query-pinecone?query=${query}`);
  const text = await response.text();
  return text;
};
