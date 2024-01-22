import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  formQuestionPrompt,
  noContextPrompt,
  ragAgentResponsePrompt,
} from './rag-prompts';
import { loadChatModel } from '../../models/chat';

let chatModel: ChatOpenAI | null = null;

const formQuestion = async ({
  question,
  history: chatHistory,
}: {
  question: string;
  history: string;
}) => {
  const questionPromptTemplate = await formQuestionPrompt.formatPromptValue({
    chat_history: chatHistory,
    question,
  });

  const messages = questionPromptTemplate.toChatMessages();

  if (!chatModel) {
    const { chat } = loadChatModel({
      modelName: 'gpt-3.5-turbo-16k',
    });
    chatModel = chat;
  }

  const chatResponse = await chatModel.call(messages);

  return chatResponse.content;
};

export const ragChain = async ({
  query,
  chatHistory,
  context,
}: {
  query: string;
  chatHistory: string;
  context: string;
}) => {
  if (!query) {
    throw new Error('No question found');
  }

  if (!context) {
    const responsePrompt = noContextPrompt;
    return {
      responsePrompt,
      question: '',
    };
  }
  let question = query;

  if (chatHistory && question) {
    question = await formQuestion({
      question,
      history: chatHistory,
    });
  }

  const responsePrompt = await ragAgentResponsePrompt({
    question,
    context,
    conversation_history: chatHistory,
  });

  return {
    responsePrompt,
    question,
  };
};
