import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  MessageModel,
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import Linkify from 'react-linkify';

interface ChatProps {
  onSubmitHandler: (message: string, chatHistory: string) => Promise<string>;
  height?: string;
  startingValue?: string;
  placeHolder?: string;
}

const Chat: React.FC<ChatProps> = ({ onSubmitHandler, height, startingValue, placeHolder }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [msgInputValue, setMsgInputValue] = useState(startingValue);
  const [messages, setMessages] = useState<MessageModel[]>([
    {
      message: 'Welcome to the Langchain JS Crash Course!',
      sender: 'Assistant',
      direction: 'incoming',
      position: 'single',
      sentTime: 'initial',
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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
    },
    [setMessages],
  );
  const handleSend = useCallback(
    async (message: string) => {
      addMessage(message, 'User', 'outgoing');
      setMsgInputValue('');
      inputRef.current?.focus();
      setLoading(true);
      const chatHistory = messages.map((msg) => msg.message).join('\n');
      try {
        const answer = await onSubmitHandler(message, chatHistory);
        setLoading(false);
        addMessage(answer, 'Assistant', 'incoming');
      } catch (error) {
        setLoading(false);
        addMessage(
          'Sorry, there was an error processing your request. Please try again later.',
          'Assistant',
          'incoming',
        );
      }
    },
    [addMessage, setLoading, inputRef, setMsgInputValue, messages, onSubmitHandler],
  );

  return (
    <div
      style={{
        height: height || '500px',
      }}
    >
      <ChatContainer>
        <MessageList typingIndicator={loading && <TypingIndicator content="Knapsack is typing" />}>
          {messages.map((message) => (
            <Message
              key={message.sentTime}
              model={{
                direction: message.direction,
                position: message.position,
              }}
            >
              <Message.CustomContent>
                <Linkify
                  componentDecorator={(decoratedHref: string, decoratedText: string, key: React.Key) => (
                    <a target="blank" rel="noopener" href={decoratedHref} key={key}>
                      {decoratedText}
                    </a>
                  )}
                >
                  {message.message}
                </Linkify>
              </Message.CustomContent>
            </Message>
          ))}
        </MessageList>
        <MessageInput
          placeholder={placeHolder || 'Type question here'}
          onSend={handleSend}
          onChange={setMsgInputValue}
          value={msgInputValue}
          ref={inputRef}
          sendOnReturnDisabled={false}
          attachButton={false}
        />
      </ChatContainer>
    </div>
  );
};

export default Chat;
