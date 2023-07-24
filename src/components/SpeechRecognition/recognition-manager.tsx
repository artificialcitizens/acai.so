/* eslint-disable no-case-declarations */
// import { takeNotes } from '../Chat/chat-routes';
import { avaChat } from '../../utils/sb-langchain/agents/ava';
import { noteChain } from '../../utils/sb-langchain/chains/notes-chain';

export const recognitionRouter = async ({
  state,
  transcript,
  openAIKey,
  callbacks,
}: {
  state: string;
  transcript: string;
  openAIKey: string;
  callbacks: any;
}) => {
  console.log(openAIKey);
  switch (state) {
    // case 'strahl':
    //   const response = await fetch(`http://192.168.4.74:3000/strahl?query=${transcript}`);
    //   const json = await response.json();
    //   return json.response;
    case 'ava':
      // const answer = await avaChat({ input: transcript, openAIApiKey: openAIKey, callbacks });
      // return answer;
      return 'im ava';
    case 'chat':
      // return 'hello world';
      break;
    case 'passive':
      const observations = [];
      // return 'hello world';
      break;
    case 'idle':
      break;
    default:
      console.log('no match');
      break;
  }
};

export const takeNotesRoute = async (transcript: string, openAIKey: string, priorList?: string) => {
  const notes = await noteChain(transcript, openAIKey, priorList);
  return notes;
};
