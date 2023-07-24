import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import './Chat.css';
import Dropzone from '../Dropzone/Dropzone';
import { toast } from 'react-toastify';
import { toastifyError, toastifySuccess } from '../Toast';
import Linkify from 'react-linkify';
import { GlobalStateContext, GlobalStateContextValue } from '../../context/GlobalStateContext';
import { useActor } from '@xstate/react';
import { ChatHistory } from '../../state';
import { useLocation } from 'react-router-dom';

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
  const { uiStateService, agentStateService, appStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [msgInputValue, setMsgInputValue] = useState(startingValue);
  const workspaceId = location.pathname.split('/')[1];
  const [state, send] = useActor(agentStateService);
  const recentChatHistory = state.context[workspaceId]?.recentChatHistory;
  const [messages, setMessages] = useState<any[]>(
    recentChatHistory.map((history: ChatHistory) => {
      return {
        message: history.text,
        direction: history.type === 'user' ? 'outgoing' : 'incoming',
        sender: history.type === 'user' ? 'User' : 'Assistant',
        position: 'single',
        sentTime: history.timestamp,
      };
    }),
  );
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

      const userChatHistory: ChatHistory = {
        id: workspaceId,
        text: message,
        timestamp: Math.floor(Date.now() / 1000).toString(),
        type: 'user',
      };

      send({
        type: 'UPDATE',
        agent: {
          workspaceId: workspaceId,
          recentChatHistory: [...recentChatHistory, userChatHistory],
        },
      });

      setLoading(true);

      try {
        const answer = await onSubmitHandler(
          message,
          recentChatHistory.map((history: ChatHistory) => history.text).join('\n'),
        );

        const assistantChatHistory: ChatHistory = {
          id: workspaceId,
          text: answer,
          timestamp: Math.floor(Date.now() / 1000).toString(),
          type: 'ava',
        };

        send({
          type: 'UPDATE_CHAT_HISTORY',
          workspaceId: workspaceId,
          recentChatHistory: [...recentChatHistory, userChatHistory, assistantChatHistory],
        });

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
    [addMessage, setLoading, inputRef, setMsgInputValue, onSubmitHandler, recentChatHistory, send, workspaceId],
  );

  const handleFileDrop = (file: File) => {
    console.log(file);
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
