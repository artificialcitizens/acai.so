import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
} from 'react';
import {
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  InputToolbox,
} from '@chatscope/chat-ui-kit-react';
import './Chat.css';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import { useActor } from '@xstate/react';
import { ChatHistory } from '../../state';
import { useLocation } from 'react-router-dom';
import Dropzone from '../Dropzone/Dropzone';
import { readFileAsText, slugify } from '../../utils/data-utils.ts';
// import { convertDSPTranscript } from '../../utils/ac-langchain/text-splitters/dsp-splitter.ts';
// import yaml from 'js-yaml';
import Linkify from 'linkify-react';
import DOMPurify from 'dompurify';
import he from 'he';
import { Button } from '../Button/Button';
import { SendIcon, SpinnerIcon, StopIcon, TrashIcon } from '../Icons/Icons';
import { toastifyError, toastifyInfo } from '../Toast';
import { VectorStoreContext } from '../../context/VectorStoreContext.tsx';
import { db } from '../../../db';

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
  const location = useLocation();
  const workspaceId = location.pathname.split('/')[1];
  const inputRef = useRef<HTMLInputElement>(null);
  const [msgInputValue, setMsgInputValue] = useState(startingValue);
  const [state, send] = useActor(agentStateService);

  const [controller, setController] = useState<AbortController | null>(
    abortController,
  );

  const context = useContext(VectorStoreContext);

  // useEffect(() => {
  //   setController(abortController);
  // }, [abortController]);

  const recentChatHistory = state.context[workspaceId]?.recentChatHistory;
  const [messages, setMessages] = useState<any[]>(
    recentChatHistory?.map((history: ChatHistory) => {
      return {
        message: history.text,
        direction: history.type === 'user' ? 'outgoing' : 'incoming',
        sender: history.type === 'user' ? 'User' : 'Assistant',
        position: 'single',
        sentTime: history.timestamp,
      };
    }),
  );

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setMessages(
      recentChatHistory?.map((history: ChatHistory) => {
        return {
          message: history.text,
          direction: history.type === 'user' ? 'outgoing' : 'incoming',
          sender: history.type === 'user' ? 'User' : 'Assistant',
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
    },
    [setMessages],
  );

  const createChatHistory = (
    workspaceId: string,
    text: string,
    type: 'user' | 'ava',
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
            sender: 'Assistant',
            position: 'single',
            sentTime: Math.floor(Date.now() / 1000).toString(),
          },
        ];
      });
    }
  }, [streamingMessage, addMessage]);

  const handleSend = useCallback(
    async (message: string) => {
      addMessage(message, 'User', 'outgoing');
      setMsgInputValue('');
      inputRef.current?.focus();

      const userChatHistory = createChatHistory(workspaceId, message, 'user');

      send({
        type: 'UPDATE_CHAT_HISTORY',
        agent: {
          workspaceId: workspaceId,
          recentChatHistory: [...recentChatHistory, userChatHistory],
        },
      });

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
          'ava',
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

        addMessage(answer, 'Assistant', 'incoming');
      } catch (error) {
        addMessage(
          'Sorry, there was an error processing your request. Please try again later.',
          'Assistant',
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
    const sanitizedInput = sanitizeMessage(innerHTML);
    setMsgInputValue(sanitizedInput);
  };

  const sanitizeMessage = (message: string) => {
    const decodedMessage = he.decode(message);
    const sanitizedMessage = DOMPurify.sanitize(decodedMessage, {
      ALLOWED_TAGS: ['a'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
    return sanitizedMessage;
  };

  // @TODO: Move logic to Dropzone component
  const handleFileDrop = async (files: File[], name: string) => {
    for (const file of files) {
      if (!file) return;

      const fileExtension = file.name.split('.').pop();
      // const reader = new FileReader();
      switch (fileExtension) {
        case 'txt':
        case 'md':
          {
            try {
              toastifyInfo(`📁 Processing ${file.name}`);
              const fileContent = await readFileAsText(file);
              const slugifiedFilename = slugify(file.name);
              if (context) {
                // need to figure out how to pass metadata to filter by
                const memoryVectors = await context.addText(fileContent);
                const id = db.memoryVectors.add({
                  id: slugifiedFilename,
                  workspaceId,
                  memoryVectors: memoryVectors || [],
                });
              } else {
                throw new Error('Context is null');
              }
            } catch (error) {
              toastifyError(`Error processing file: ${file.name}`);
            } finally {
              toastifyInfo(`File uploaded successfully: ${file.name}`);
            }
          }
          break;
        //       case 'jpg':
        //       case 'jpeg':
        //       case 'png':
        //         reader.onload = () => {
        //           toast.update(`${file.name}`, {
        //             render: 'Image uploaded successfully',
        //             type: 'success',
        //             autoClose: 5000,
        //           });
        //         };
        //         reader.readAsDataURL(file);
        //         break;
        default:
          toastifyError(`Please upload a .txt or .md file`);
          break;
      }
    }

    // // Save as JSON file
    // const jsonContent = JSON.stringify(conversations, null, 2);
    // const jsonFile = new Blob([jsonContent], { type: 'application/json' });
    // const jsonDownloadLink = document.createElement('a');
    // jsonDownloadLink.href = URL.createObjectURL(jsonFile);
    // jsonDownloadLink.download = `${name}.json`;
    // jsonDownloadLink.click();

    // // Convert JSON to YAML
    // const yamlContent = yaml.dump(conversations);

    // // Save as YAML file
    // const yamlFile = new Blob([yamlContent], { type: 'application/x-yaml' });
    // const yamlDownloadLink = document.createElement('a');
    // yamlDownloadLink.href = URL.createObjectURL(yamlFile);
    // yamlDownloadLink.download = `${name}.yml`;
    // yamlDownloadLink.click();
  };

  const linkProps = {
    onClick: (event: any) => {
      event.preventDefault();
      const url = event.target.href;
      window.open(url, '_blank');
    },
  };
  return (
    <>
      <Dropzone onFilesDrop={handleFileDrop}>
        <div className="rounded-lg overflow-hidden w-full">
          <ChatContainer className="bg-dark">
            <MessageList
              className="bg-dark"
              typingIndicator={
                loading && <TypingIndicator content={`${name} is thinking`} />
              }
            >
              {messages?.map((message) => (
                <Message
                  key={message.sentTime + message.sender}
                  model={{
                    direction: message.direction,
                    position: message.position,
                  }}
                >
                  <Message.CustomContent>
                    {/* https://linkify.js.org/docs */}
                    <Linkify options={{ attributes: linkProps }}>
                      {sanitizeMessage(message.message)}
                    </Linkify>
                  </Message.CustomContent>
                </Message>
              ))}
            </MessageList>
          </ChatContainer>
        </div>
      </Dropzone>
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

// const handleFileDrop = async (files: File[], name: string) => {
//   const conversations: { [key: string]: any } = {};

//   for (const file of files) {
//     if (!file) return;
//     console.log(file);
//     toast(`📁 Processing ${file.name}`, {
//       toastId: `${file.name}`,
//       className: 'custom-toast',
//       position: 'top-right',
//       autoClose: false,
//       hideProgressBar: false,
//       closeOnClick: true,
//       pauseOnHover: true,
//       draggable: true,
//       theme: 'dark',
//     });

//     const fileExtension = file.name.split('.').pop();
//     const reader = new FileReader();

//     switch (fileExtension) {
//       case 'jpg':
//       case 'jpeg':
//       case 'png':
//         reader.onload = () => {
//           toast.update(`${file.name}`, {
//             render: 'Image uploaded successfully',
//             type: 'success',
//             autoClose: 5000,
//           });
//         };
//         reader.readAsDataURL(file);
//         break;
//       default:
//         try {
//           const fileContent = await readFileAsText(file);

//           const conversation = convertDSPTranscript(fileContent);

//           const slugifiedFilename = slugify(file.name);
//           conversations[slugifiedFilename] = conversation;

//           toast.update(`${file.name}`, {
//             render: 'File uploaded successfully',
//             type: 'success',
//             autoClose: 5000,
//           });
//         } catch (error) {
//           console.error('Error processing file:', file, error);
//           toast.update(`${file.name}`, {
//             render: 'Error processing file',
//             type: 'error',
//             autoClose: 5000,
//           });
//         }
//     }
//   }

//   // Save as JSON file
//   const jsonContent = JSON.stringify(conversations, null, 2);
//   const jsonFile = new Blob([jsonContent], { type: 'application/json' });
//   const jsonDownloadLink = document.createElement('a');
//   jsonDownloadLink.href = URL.createObjectURL(jsonFile);
//   jsonDownloadLink.download = `${name}.json`;
//   jsonDownloadLink.click();

//   // Convert JSON to YAML
//   const yamlContent = yaml.dump(conversations);

//   // Save as YAML file
//   const yamlFile = new Blob([yamlContent], { type: 'application/x-yaml' });
//   const yamlDownloadLink = document.createElement('a');
//   yamlDownloadLink.href = URL.createObjectURL(yamlFile);
//   yamlDownloadLink.download = `${name}.yml`;
//   yamlDownloadLink.click();
// };
