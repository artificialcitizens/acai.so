import React, { useEffect, useState, useRef, useCallback, useId } from 'react';
import {
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  MessageModel,
} from '@chatscope/chat-ui-kit-react';
import './Chat.css';
import Dropzone from '../Dropzone/Dropzone';
import { toast } from 'react-toastify';
import { toastifyError, toastifySuccess } from '../Toast';
import { marked } from 'marked';
import { useLocalStorage, useLocalStorageString } from '../../hooks/use-local-storage';
import Linkify from 'react-linkify';

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

  const handleFileDrop = (file: File) => {
    console.log(file);
    // Check file type
    toast(`📁 Processing ${file.name}`, {
      toastId: `${file.name}`,
      className: 'custom-toast',
      position: 'top-right',
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'dark',
    });
    const fileExtension = file.name.split('.').pop();
    const reader = new FileReader();
    switch (fileExtension) {
      case '.jpg':
      case '.jpeg':
      case '.png':
        reader.onload = () => {
          toastifySuccess('Image uploaded successfully');
        };
        reader.readAsDataURL(file);
        break;
      default:
        reader.onload = (e) => {
          const text = e.target?.result as string;
          console.log(text);
          toastifySuccess('File uploaded successfully');
        };
        reader.readAsText(file);
    }
  };
  return (
    // @TODO: Link up file loader to context
    <Dropzone onFileDrop={handleFileDrop}>
      <div className="rounded-lg overflow-hidden w-full">
        {/* <div className="rounded-lg overflow-hidden w-full"> */}
        <ChatContainer className="bg-dark">
          <MessageList
            className="bg-dark"
            typingIndicator={loading && <TypingIndicator content={`${name} is thinking`} />}
          >
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
            className="bg-dark border-dark"
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
    </Dropzone>
  );
};

export default Chat;
