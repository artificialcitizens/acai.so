/* eslint-disable no-case-declarations */
import { avaChat, takeNotes } from '../Chat/chat-routes';

export const recognitionRouter = async ({ state, transcript }: { state: string; transcript: string }) => {
  switch (state) {
    case 'strahl':
      const response = await fetch(`http://192.168.4.74:3000/strahl?query=${transcript}`);
      return response;
    case 'ava':
      const answer = await avaChat(transcript);
      return answer;
    case 'chat':
      return 'hello world';
    case 'passive':
      const observations = [];
      return 'hello world';
    default:
      console.log('no match');
      break;
  }
};

export const takeNotesRoute = async (transcript: string) => {
  const notes = await takeNotes(transcript);
  return notes;
};
