/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
// eslint-disable-next-line import/named
import { BubbleMenu, BubbleMenuProps } from '@tiptap/react';
import cx from 'classnames';
import { FC, useState, useEffect, useRef } from 'react';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeIcon,
  SparklesIcon,
} from 'lucide-react';
import { useAva } from '../../Ava/use-ava';

import { NodeSelector } from './NodeSelector';
import { toastifyInfo } from '../../Toast';

export interface BubbleMenuItem {
  name: string;
  isActive: () => boolean;
  command: () => void;
  icon: typeof BoldIcon;
}

type EditorBubbleMenuProps = Omit<BubbleMenuProps, 'children'>;

type CursorPosition = {
  from: number;
  to: number;
};

export const EditorBubbleMenu: FC<EditorBubbleMenuProps> = (props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const replaceButtonRef = useRef<HTMLButtonElement>(null);
  const [askAi, setAskAi] = useState<string>('');
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [askAiPopover, setAskAiPopover] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [selectedText, setSelectedText] = useState<string>('');
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({
    from: 0,
    to: 0,
  });

  const [messages, setMessages] = useState<any[]>(
    [],
    // recentChatHistory?.map((history: ChatHistory) => {
    //   return {
    //     message: history.text,
    //     direction: history.type === 'user' ? 'outgoing' : 'incoming',
    //     sender: history.type === 'user' ? 'user' : 'assistant',
    //     position: 'single',
    //     sentTime: history.timestamp,
    //   };
    // }),
  );

  const { queryAva, streamingMessage, loading } = useAva();

  useEffect(() => {
    if (streamingMessage) {
      setAiResponse(streamingMessage);
    }
  }, [streamingMessage]);
  useEffect(() => {
    // Function to handle click events
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputWrapperRef.current &&
        !inputWrapperRef?.current?.contains(event.target as Node)
      ) {
        setAiResponse('');
        setAskAiPopover(false);
      }
    };

    // Add event listener when askAiPopover is open
    if (askAiPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup function to remove the event listener when the component unmounts or askAiPopover is closed
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [askAiPopover, inputRef]);

  useEffect(() => {
    if (!inputRef.current) return;
    if (askAiPopover) {
      inputRef.current.focus();
    } else {
      setAskAi('');
    }
  }, [askAiPopover]);
  const items: BubbleMenuItem[] = [
    {
      name: 'bold',
      isActive: () => props.editor.isActive('bold'),
      command: () => props.editor.chain().focus().toggleBold().run(),
      icon: BoldIcon,
    },
    {
      name: 'italic',
      isActive: () => props.editor.isActive('italic'),
      command: () => props.editor.chain().focus().toggleItalic().run(),
      icon: ItalicIcon,
    },
    {
      name: 'underline',
      isActive: () => props.editor.isActive('underline'),
      command: () => props.editor.chain().focus().toggleUnderline().run(),
      icon: UnderlineIcon,
    },
    {
      name: 'strike',
      isActive: () => props.editor.isActive('strike'),
      command: () => props.editor.chain().focus().toggleStrike().run(),
      icon: StrikethroughIcon,
    },
    {
      name: 'code',
      isActive: () => props.editor.isActive('code'),
      command: () => props.editor.chain().focus().toggleCode().run(),
      icon: CodeIcon,
    },
  ];

  const bubbleMenuProps: EditorBubbleMenuProps = {
    ...props,
    tippyOptions: {
      moveTransition: 'transform 0.15s ease-out',
      onHidden: () => setIsNodeSelectorOpen(false),
    },
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const handleTransaction = () => {
      const { from, to } = props.editor.state.selection;
      if (from !== to) {
        // check if there is a selection
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          const selectedText = props.editor.state.doc.textBetween(from, to);
          setSelectedText(selectedText);
          setCursorPosition({ from, to });
          // toastifyInfo(`Selected text: ${selectedText}`);
          // toastifyInfo(`Cursor position from: ${from}, to: ${to}`);
        }, 500); // adjust delay as needed
      }
    };

    // Subscribe to transaction updates
    props.editor.on('transaction', handleTransaction);

    // Cleanup on unmount
    return () => {
      props.editor.off('transaction', handleTransaction);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [props.editor]);
  const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
  const calculatedLeft = window.innerWidth < 640 ? 0 : cursorCoords.x;
  return (
    <>
      <div
        ref={inputWrapperRef}
        className={`fixed bg-light left-0 rounded-none w-screen md:w-[25vw] max-h-[50vh] md:rounded-lg border border-solid border-light transition-opacity ${
          !askAiPopover
            ? 'opacity-0 pointer-events-none'
            : 'opacity-1 pointer-events-auto'
        }`}
        style={{ left: calculatedLeft, top: cursorCoords.y + 5, zIndex: 10000 }}
      >
        <p className="text-xs p-2 overflow-auto">
          {aiResponse || selectedText}
        </p>
        <form
          className="flex shadow-lg rounded-lg p-3 md:p-2 justify-items-center"
          onSubmit={(e) => {
            e.preventDefault();
            const response = queryAva({
              message: askAi,
              systemMessage: selectedText,
              override: 'document',
              args: {
                highlighted: selectedText,
                task: askAi,
              },
            });
            setAiResponse(streamingMessage);
            setAskAi('');
            setTimeout(() => {
              inputRef.current?.focus();
            }, 100);
            // setAskAiPopover(!askAiPopover);
            // props.editor.commands.focus();
            // props.editor.commands.insertContent(askAi);
          }}
          // onKeyDown={(e) => {
          //   if (e.key === 'Enter') {
          //     // e.preventDefault();
          //     // setAiResponse(mockResponse);
          //     // setAskAi('');
          //     inputRef.current?.focus();
          //   }
          // }}
        >
          <input
            className={`z-50 p-2 md:p-1 text-base md:text-xs bg-base border-light border border-solid w-full rounded-lg  inline-block overflow-auto focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50`}
            value={askAi}
            placeholder={loading ? 'Loading' : 'Ask AI'}
            onChange={(e) => setAskAi(e.target.value)}
            ref={inputRef}
            onClick={(e) => {
              if (!askAiPopover) return;
              e.stopPropagation();
              // props.editor.commands.blur();
              // inputRef.current?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                // e.currentTarget.blur();
                setAskAiPopover(!askAiPopover);
                setAiResponse('');
                props.editor.commands.focus();
              }
            }}
            style={{
              position: 'inherit',
              maxHeight: '50vh',
            }}
          />
          <input
            type="submit"
            value="Ask AI"
            className="hidden md:inherit bg-dark text-acai-white font-bold max-w-min self-center ml-2 text-sm md:text-xs px-4 py-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
          />
        </form>
        {aiResponse && (
          <span className="flex justify-end bg-light mb-2 mr-2">
            <button
              type="button"
              className=" bg-dark text-acai-white font-bold max-w-min self-center ml-2 text-sm md:text-xs px-4 py-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
              onClick={() => {
                setAiResponse('');
                setAskAi('');
                setAskAiPopover(false);
              }}
              disabled={loading}
            >
              Discard
            </button>
            <button
              className=" bg-dark text-acai-white font-bold max-w-min self-center ml-2 text-sm md:text-xs px-4 py-2 rounded-md transition-colors duration-200 ease-in-out hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-gray-50 focus:ring-opacity-50 cursor-pointer"
              type="button"
              ref={replaceButtonRef}
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                setAskAiPopover(!askAiPopover);
                props.editor.commands.focus();
                setTimeout(() => {
                  props.editor.commands.insertContent(aiResponse);
                }, 100);
                setAiResponse('');
                setAskAi('');
              }}
            >
              Replace
            </button>
          </span>
        )}
      </div>

      <BubbleMenu
        {...bubbleMenuProps}
        className="flex overflow-hidden rounded border border-lighter bg-dark shadow-xl top-8"
      >
        <NodeSelector
          editor={props.editor}
          isOpen={isNodeSelectorOpen}
          setIsOpen={setIsNodeSelectorOpen}
        />
        <button
          key={'ask-ai'}
          onClick={() => {
            // Calculate cursor position
            const { to } = props.editor.state.selection;
            const rect = props.editor.view.dom.getBoundingClientRect();
            const coords = props.editor.view.coordsAtPos(to);
            setCursorCoords({
              x: coords.left - rect.left,
              y: coords.top - rect.top,
            });

            setAskAiPopover(true);
            setTimeout(() => {
              inputRef.current?.focus();
            }, 100);
          }}
          className="p-2 text-acai-white hover:bg-darker active:bg-darker"
        >
          <SparklesIcon
            className={cx('h-4 w-4', {
              // @TODO: update this to use a state variable
              'text-blue-500': true,
            })}
          />
        </button>

        {items.map((item, index) => (
          <button
            key={index}
            onClick={item.command}
            className="p-2 text-acai-white hover:bg-darker active:bg-darker"
          >
            <item.icon
              className={cx('h-4 w-4', {
                'text-blue-500': item.isActive(),
              })}
            />
          </button>
        ))}
      </BubbleMenu>
    </>
  );
};
