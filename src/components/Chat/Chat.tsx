import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
  ReactNode,
} from 'react';
import {
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  InputToolbox,
} from '@chatscope/chat-ui-kit-react';
import './Chat.css';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import { useActor } from '@xstate/react';
import { ChatHistory } from '../../state';
import { useParams } from 'react-router-dom';

import ReactMarkdown from 'react-markdown';
import remarkFootnotes from 'remark-footnotes';

import { Button } from '../Button/Button';
import { SendIcon, SpinnerIcon, StopIcon, TrashIcon } from '../Icons/Icons';
import { MessageRole } from '../Ava/use-ava';

const markdownComponents = {
  code: ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <pre className="p-2">
        <code className="text-sm" {...props}>
          {String(children).replace(/\n$/, '')}
        </code>
      </pre>
    ) : (
      <code className="text-sm" {...props}>
        {children}
      </code>
    );
  },
  p: ({ children }: { children: ReactNode }) => (
    <p className="mb-1 text-sm">{children}</p>
  ),
  li: ({ children }: { children: ReactNode }) => (
    <li className="text-sm sm:text-bas list-disc ml-1 mb-0 pb-0">{children}</li>
  ),
  h1: ({ children }: { children: ReactNode }) => (
    <h1 className="text-2xl font-bold py-2">{children}</h1>
  ),
  h2: ({ children }: { children: ReactNode }) => (
    <h2 className="text-xl font-bold py-2">{children}</h2>
  ),
  h3: ({ children }: { children: ReactNode }) => (
    <h3 className="text-lg font-bold py-2">{children}</h3>
  ),
  h4: ({ children }: { children: ReactNode }) => (
    <h4 className="text-base font-bold py-2">{children}</h4>
  ),
  h5: ({ children }: { children: ReactNode }) => (
    <h5 className="text-sm font-bold py-2">{children}</h5>
  ),
  em: ({ children }: { children: ReactNode }) => (
    <em className="italic">{children}</em>
  ),
  strong: ({ children }: { children: ReactNode }) => (
    <strong className="font-bold">{children}</strong>
  ),
  del: ({ children }: { children: ReactNode }) => (
    <del className="line-through">{children}</del>
  ),
  ul: ({ children }: { children: ReactNode }) => (
    <ul className="list-disc ml-6 mb-0 py-0">{children}</ul>
  ),
  ol: (props: {
    children: ReactNode;
    start?: number;
    ordered?: boolean;
    depth: number;
  }) => (
    <ol className="list-decimal ml-6" start={props.start}>
      {props.children}
    </ol>
  ),
  blockquote: ({ children }: { children: ReactNode }) => (
    <blockquote className="border-l-4 pl-4">{children}</blockquote>
  ),
  a: ({ children, href }: { children: ReactNode; href?: string }) => {
    const isLocalLink =
      href && (href.startsWith(window.location.origin) || href.startsWith('/'));
    return (
      <a
        href={href}
        className="text-blue-500 hover:underline"
        {...(isLocalLink
          ? {}
          : { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {children}
      </a>
    );
  },
  table: ({ children }: { children: ReactNode }) => (
    <table className="w-full text-sm text-center text-gray-500 dark:text-gray-400 border">
      {children}
    </table>
  ),
  thead: ({ children }: { children: ReactNode }) => (
    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
      {children}
    </thead>
  ),
  th: ({ children }: { children: ReactNode }) => (
    <th className="p-2 text-gray-300 ">{children}</th>
  ),
  td: ({ children }: { children: ReactNode }) => (
    <td className="p-2 border bg-gray-100 text-gray-900">{children}</td>
  ),
};

// https://chatscope.io/storybook/react/?path=/story/documentation-introduction--page
interface ChatProps {
  onSubmitHandler: (message: string, chatHistory: string) => Promise<string>;
  loading: boolean;
  streamingMessage?: string;
  abortController: AbortController | null;
  height?: string;
  startingValue?: string;
  placeHolder?: string;
  name: string;
  avatar: string;
}
const Chat: React.FC<ChatProps> = ({
  onSubmitHandler,
  loading,
  streamingMessage,
  startingValue,
  abortController,
  name = 'Ava',
}) => {
  const { agentStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const { workspaceId: rawWorkspaceId } = useParams<{
    workspaceId: string;
    domain: string;
    id: string;
  }>();

  const workspaceId = rawWorkspaceId || 'docs';

  const inputRef = useRef<HTMLInputElement>(null);
  const [msgInputValue, setMsgInputValue] = useState(startingValue);
  const [state, send] = useActor(agentStateService);

  // const [controller, setController] = useState<AbortController | null>(
  //   abortController,
  // );

  // useEffect(() => {
  //   setController(abortController);
  // }, [abortController]);

  useEffect(() => {
    send({ type: 'LOAD', workspaceId });
  }, [send, workspaceId]);

  const recentChatHistory = state.context[workspaceId]?.recentChatHistory;

  const [messages, setMessages] = useState<any[]>(
    recentChatHistory?.map((history: ChatHistory) => {
      return {
        message: history.text,
        direction: history.type === 'user' ? 'outgoing' : 'incoming',
        sender: history.type === 'user' ? 'user' : 'assistant',
        position: 'single',
        sentTime: history.timestamp,
      };
    }),
  );

  useEffect(() => {
    if (inputRef.current) {
      if (!/Android|webOS|iPhone|iPad|/i.test(navigator.userAgent)) {
        inputRef.current?.focus();
      }
    }
  }, []);

  useEffect(() => {
    setMessages(
      recentChatHistory?.map((history: ChatHistory) => {
        return {
          message: history.text,
          direction: history.type === 'user' ? 'outgoing' : 'incoming',
          sender: history.type === 'user' ? 'user' : 'assistant',
          position: 'single',
          sentTime: history.timestamp,
        };
      }),
    );
  }, [recentChatHistory, workspaceId]);

  const addMessage = useCallback(
    (message: string, sender: string, direction: 'incoming' | 'outgoing') => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          message,
          direction,
          sender,
          position: 'single',
          sentTime: Math.floor(Date.now() / 1000).toString(),
        },
      ]);
      const chatHistory = createChatHistory(
        workspaceId,
        message,
        sender as 'assistant' | 'user',
      );

      return chatHistory;
    },

    [workspaceId],
  );

  const createChatHistory = (
    workspaceId: string,
    text: string,
    type: MessageRole,
  ): ChatHistory => {
    return {
      id: workspaceId,
      text: text,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      type: type,
    };
  };

  useEffect(() => {
    if (streamingMessage) {
      setMessages((prevMessages) => {
        // Check if the last message was from the assistant
        const lastMessageIsFromAssistant =
          prevMessages.length > 0 &&
          prevMessages[prevMessages.length - 1].direction === 'incoming';

        // If the last message was from the assistant, slice it off
        const messagesToKeep = lastMessageIsFromAssistant
          ? prevMessages.slice(0, prevMessages.length - 1)
          : prevMessages;

        return [
          ...messagesToKeep,
          {
            message: streamingMessage,
            direction: 'incoming',
            sender: 'assistant',
            position: 'single',
            sentTime: Math.floor(Date.now() / 1000).toString(),
          },
        ];
      });
    }
  }, [streamingMessage, addMessage]);

  const handleSend = useCallback(
    async (message: string) => {
      const userChatHistory = addMessage(message, 'user', 'outgoing');
      setMsgInputValue('');
      if (!/Android|webOS|iPhone|iPad|/i.test(navigator.userAgent)) {
        inputRef.current?.focus();
      }
      try {
        const answer = await onSubmitHandler(
          message,
          recentChatHistory
            .map((history: ChatHistory) => history.text)
            .join('\n'),
        );

        const assistantChatHistory = createChatHistory(
          workspaceId,
          answer,
          'assistant',
        );

        send({
          type: 'UPDATE_CHAT_HISTORY',
          workspaceId: workspaceId,
          recentChatHistory: [
            ...recentChatHistory,
            userChatHistory,
            assistantChatHistory,
          ],
        });

        addMessage(answer, 'assistant', 'incoming');
      } catch (error) {
        addMessage(
          'Sorry, there was an error processing your request. Please try again later.',
          'assistant',
          'incoming',
        );
      }
    },
    [
      addMessage,
      inputRef,
      setMsgInputValue,
      onSubmitHandler,
      recentChatHistory,
      send,
      workspaceId,
    ],
  );

  const handleInputChange = (innerHTML: string) => {
    const trimmedInput = innerHTML.trim();
    setMsgInputValue(trimmedInput);
  };

  return (
    <>
      <div className="rounded-lg overflow-hidden w-full h-full">
        <ChatContainer className="bg-dark">
          <MessageList className="bg-dark">
            {messages?.map((message) => (
              <Message
                key={message.sentTime + message.sender}
                model={{
                  direction: message.direction,
                  position: message.position,
                }}
              >
                <Message.CustomContent>
                  <ReactMarkdown
                    components={markdownComponents}
                    remarkPlugins={[remarkFootnotes]}
                  >
                    {message.message}
                  </ReactMarkdown>
                </Message.CustomContent>
              </Message>
            ))}
          </MessageList>
        </ChatContainer>
      </div>
      <span className="flex">
        <InputToolbox
          style={{
            backgroundColor: 'transparent',
            padding: '0.25rem',
            marginLeft: '0.5rem',
          }}
        >
          <Button
            variant="icon"
            onClick={() =>
              agentStateService.send({
                type: 'CLEAR_CHAT_HISTORY',
                workspaceId,
              })
            }
          >
            <TrashIcon />
          </Button>
        </InputToolbox>
        <MessageInput
          className="bg-dark border-dark flex-grow max-w-full"
          style={{ backgroundColor: 'transparent', padding: '0.5rem' }}
          onSend={handleSend}
          onChange={handleInputChange}
          value={msgInputValue}
          ref={inputRef}
          sendOnReturnDisabled={false}
          attachButton={false}
          sendButton={false}
        />
        <InputToolbox
          style={{
            backgroundColor: 'transparent',
            padding: '0.25rem',
            marginRight: '0.5rem',
          }}
        >
          {!loading ? (
            <Button
              variant="icon"
              onClick={() => {
                if (msgInputValue) handleSend(msgInputValue);
              }}
            >
              <SendIcon />
            </Button>
          ) : (
            // update when figure out how to cancel request
            <Button
              variant="icon"
              onClick={() => {
                // if (controller) controller.abort();
              }}
            >
              {/* <StopIcon /> */}
              <SpinnerIcon />
            </Button>
          )}
        </InputToolbox>
      </span>
    </>
  );
};

export default Chat;
