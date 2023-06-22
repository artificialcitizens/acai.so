export const recognitionRouter = async ({ state, transcript }: { state: string; transcript: string }) => {
  switch (state) {
    case 'chris':
      const response = await fetch(`http://192.168.4.74:3000/strahl?query=${transcript}`);
      return response;
    default:
      console.log('no match');
      break;
  }
};
