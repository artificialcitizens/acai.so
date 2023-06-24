import React, { useEffect, useState, useRef, useCallback, useId } from 'react';
import { ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { useClickAway, useKeyPress } from '@uidotdev/usehooks';
import ReactMarkdown from 'react-markdown';
import './Chat.css';
// https://chatscope.io/storybook/react/?path=/story/documentation-introduction--page
interface ChatProps {
  onSubmitHandler: (message: string, chatHistory: string) => Promise<string>;
  height?: string;
  startingValue?: string;
  placeHolder?: string;
  name: string;
  avatar: string;
}

const Chat: React.FC<ChatProps> = ({ onSubmitHandler, height, startingValue, name = 'Ava' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [msgInputValue, setMsgInputValue] = useState(startingValue);
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const onKeyPress = (e: KeyboardEvent) => {
    if (!visible) return;
    e.preventDefault();
    setVisible(false);
  };
  useKeyPress('Escape', onKeyPress);
  const ref = useClickAway(() => {
    setVisible(false);
  });
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleClick = () => {
    setVisible(!visible);
  };

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

  return !visible ? (
    <button onClick={handleClick} className="absolute bottom-8 right-8 rounded-full py-2 px-2">
      👐
    </button>
  ) : (
    <div
      ref={ref}
      className="absolute bottom-8 right-8 pt-2 rounded-xl overflow-hidden border-2 border-solid border-gray-300 w-[600px]"
      style={{
        height: height || '500px',
      }}
    >
      <ChatContainer className="bg-transparent">
        <MessageList
          className="bg-transparent"
          typingIndicator={loading && <TypingIndicator content={`${name} is thinking`} />}
        >
          {messages.map((message) => (
            <Message
              key={message.sentTime + message.message}
              model={{
                direction: message.direction,
                position: message.position,
              }}
            >
              <Message.CustomContent>
                <ReactMarkdown>{message.message}</ReactMarkdown>
              </Message.CustomContent>
            </Message>
          ))}
        </MessageList>
        <MessageInput
          style={{ backgroundColor: 'transparent', padding: '0.5rem' }}
          onSend={handleSend}
          onChange={setMsgInputValue}
          value={msgInputValue}
          ref={inputRef}
          sendOnReturnDisabled={false}
          onAttachClick={() => {
            alert('Attach clicked');
          }}
        />
      </ChatContainer>
    </div>
  );
};

export default Chat;
